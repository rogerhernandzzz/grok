import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { requireAdmin, type IpSighting } from "./profiles";

function parseIpHistory(raw: unknown, lastIp: string | null): IpSighting[] {
  const out: IpSighting[] = [];
  if (Array.isArray(raw)) {
    for (const row of raw) {
      if (row && typeof row === "object" && "ip" in row) {
        out.push({ ip: String((row as { ip: unknown }).ip), at: String((row as { at?: unknown }).at ?? "") });
      }
    }
  }
  if (out.length === 0 && lastIp) out.push({ ip: lastIp, at: "" });
  return out.slice(0, 3);
}

export type SiteVisitor = {
  id: string;
  label: string;
  registered: boolean;
  online: boolean;
  lastSeenAt: string;
  lastPath: string | null;
  ips: IpSighting[];
};

export const pingVisitor = createServerFn({ method: "POST" })
  .validator(z.object({ visitorId: z.string().min(8).max(80).regex(/^[\w-]+$/), path: z.string().max(120) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const { clientIpFromRequest } = await import("./request-meta.server");
    const ip = clientIpFromRequest();
    const nowIso = new Date().toISOString();
    let userId: string | null = null;
    let displayName: string | null = null;
    try {
      const { getSessionUser } = await import("@/lib/auth/verify.server");
      const u = await getSessionUser();
      if (u) {
        userId = u.id;
        const p = await sql<{ display_name: string }>`select display_name from profiles where user_id = ${u.id} limit 1`;
        displayName = p[0]?.display_name ?? null;
      }
    } catch {
      /* guest */
    }
    const existing = await sql<{ last_ip: string | null; ip_history: string | null }>`
      select last_ip, ip_history::text as ip_history from visitors where id = ${data.visitorId}
    `;
    const prev = parseIpHistory(existing[0]?.ip_history ? JSON.parse(existing[0].ip_history) : null, existing[0]?.last_ip ?? null);
    const ips = prev[0]?.ip === ip ? [{ ip, at: nowIso }, ...prev.slice(1)] : [{ ip, at: nowIso }, ...prev];
    const rotated = ips.slice(0, 3);
    await sql`
      insert into visitors (id, user_id, display_name, last_ip, ip_history, last_path, last_seen_at)
      values (${data.visitorId}, ${userId}, ${displayName}, ${ip}, ${JSON.stringify(rotated)}::jsonb, ${data.path}, now())
      on conflict (id) do update set
        user_id = excluded.user_id,
        display_name = excluded.display_name,
        last_ip = excluded.last_ip,
        ip_history = excluded.ip_history,
        last_path = excluded.last_path,
        last_seen_at = now()
    `;
    await sql`delete from visitors where last_seen_at < now() - interval '14 days'`;
    return { ok: true as const };
  });

export const listVisitors = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      user_id: string | null;
      display_name: string | null;
      last_ip: string | null;
      ip_history: string | null;
      last_path: string | null;
      last_seen_at: string;
      online: boolean;
    }>`
      select id, user_id, display_name, last_ip, ip_history::text as ip_history, last_path,
        last_seen_at::text as last_seen_at,
        (last_seen_at > now() - interval '90 seconds') as online
      from visitors
      order by (last_seen_at > now() - interval '90 seconds') desc, last_seen_at desc
      limit 100
    `;
    return rows.map((row) => ({
      id: row.id,
      label: row.display_name?.trim() || `Sin cuenta · ${row.id.slice(0, 8)}`,
      registered: Boolean(row.user_id),
      online: row.online === true || String(row.online) === "t",
      lastSeenAt: row.last_seen_at,
      lastPath: row.last_path,
      ips: parseIpHistory(row.ip_history ? JSON.parse(row.ip_history) : null, row.last_ip),
    })) satisfies SiteVisitor[];
  });
