import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";

export type Profile = {
  userId: string;
  displayName: string;
  role: "member" | "admin";
  muted: boolean;
  stars: number;
  luz: number;
};

export type IpSighting = { ip: string; at: string };

export type AdminMember = Profile & {
  online: boolean;
  lastSeenAt: string | null;
  ips: IpSighting[];
};

function isOn(value: unknown) {
  return value === true || String(value) === "t";
}

function parseIpHistory(raw: unknown, lastIp: string | null): IpSighting[] {
  const out: IpSighting[] = [];
  if (Array.isArray(raw)) {
    for (const row of raw) {
      if (row && typeof row === "object" && "ip" in row) {
        const ip = String((row as { ip: unknown }).ip);
        const at = String((row as { at?: unknown }).at ?? "");
        if (ip) out.push({ ip, at });
      }
    }
  }
  if (out.length === 0 && lastIp) out.push({ ip: lastIp, at: "" });
  return out.slice(0, 3);
}

function rotateIpHistory(history: IpSighting[], ip: string, now: string): IpSighting[] {
  if (!ip || ip === "unknown") return history.slice(0, 3);
  if (history[0]?.ip === ip) return [{ ip, at: now }, ...history.slice(1)].slice(0, 3);
  return [{ ip, at: now }, ...history].slice(0, 3);
}

export async function requireAdmin(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ role: string }>`select role from profiles where user_id = ${userId} limit 1`;
  if (rows[0]?.role !== "admin") throw new Error("Solo el administrador");
}

export const ensureMyProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const existing = await sql<{ display_name: string; role: string; muted: boolean; stars: number; luz: string }>`
      select display_name, role, muted, stars, luz::text as luz from profiles where user_id = ${context.userId} limit 1
    `;
    if (existing[0]) {
      return {
        userId: context.userId,
        displayName: existing[0].display_name,
        role: existing[0].role as "member" | "admin",
        muted: isOn(existing[0].muted),
        stars: Number(existing[0].stars) || 0,
        luz: Number(existing[0].luz) || 0,
      } satisfies Profile;
    }
    const name = `Miembro ${context.userId.slice(0, 4)}`;
    await sql`
      insert into profiles (user_id, display_name, role)
      values (${context.userId}, ${name}, ${"member"})
    `;
    return { userId: context.userId, displayName: name, role: "member" as const, muted: false, stars: 0, luz: 0 };
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ display_name: string; role: string; muted: boolean; stars: number; luz: string }>`
      select display_name, role, muted, stars, luz::text as luz from profiles where user_id = ${context.userId} limit 1
    `;
    const row = rows[0];
    return {
      userId: context.userId,
      displayName: row?.display_name ?? "Miembro",
      role: (row?.role === "admin" ? "admin" : "member") as "member" | "admin",
      muted: isOn(row?.muted),
      stars: Number(row?.stars) || 0,
      luz: Number(row?.luz) || 0,
    } satisfies Profile;
  });

export const updateMyDisplayName = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ displayName: z.string().trim().min(2).max(40) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`update profiles set display_name = ${data.displayName} where user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const mine = await sql<{ role: string }>`select role from profiles where user_id = ${context.userId} limit 1`;
    const count = await sql<{ n: number }>`select count(*)::int as n from profiles where role = ${"admin"}`;
    return { isAdmin: mine[0]?.role === "admin", adminCount: count[0]?.n ?? 0 };
  });

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const count = await sql<{ n: number }>`select count(*)::int as n from profiles where role = ${"admin"}`;
    if ((count[0]?.n ?? 0) > 0) throw new Error("Ya hay un administrador");
    await sql`update profiles set role = ${"admin"} where user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const listMembers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const rows = await sql<{
      user_id: string;
      display_name: string;
      role: string;
      muted: boolean;
      stars: number;
      luz: string;
      last_seen_at: string | null;
      last_ip: string | null;
      ip_history: string | null;
      online: boolean;
    }>`
      select
        user_id, display_name, role, muted, stars, luz::text as luz,
        last_seen_at::text as last_seen_at,
        last_ip,
        ip_history::text as ip_history,
        (last_seen_at is not null and last_seen_at > now() - interval '90 seconds') as online
      from profiles
      order by
        (last_seen_at is not null and last_seen_at > now() - interval '90 seconds') desc,
        display_name asc
    `;
    return rows.map((row) => ({
      userId: row.user_id,
      displayName: row.display_name,
      role: row.role === "admin" ? "admin" : "member",
      muted: isOn(row.muted),
      stars: Math.min(3, Math.max(0, Number(row.stars) || 0)),
      luz: Number(row.luz) || 0,
      online: isOn(row.online),
      lastSeenAt: row.last_seen_at,
      ips: parseIpHistory(row.ip_history ? JSON.parse(row.ip_history) : null, row.last_ip),
    })) satisfies AdminMember[];
  });

export const setMemberRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ userId: z.string().min(1), role: z.enum(["member", "admin"]) }))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    if (data.userId === context.userId) throw new Error("No puedes cambiar tu propio rol");
    const sql = await getSql();
    await sql`update profiles set role = ${data.role} where user_id = ${data.userId}`;
    return { ok: true as const };
  });

export const setMemberMuted = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ userId: z.string().min(1), muted: z.boolean() }))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    if (data.userId === context.userId) throw new Error("No puedes silenciarte a ti mismo");
    const sql = await getSql();
    await sql`update profiles set muted = ${data.muted} where user_id = ${data.userId}`;
    return { ok: true as const };
  });

export const setMemberStars = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ userId: z.string().min(1), stars: z.number().int().min(0).max(3) }))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    await sql`update profiles set stars = ${data.stars} where user_id = ${data.userId}`;
    return { ok: true as const };
  });

export const touchPresence = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const { clientIpFromRequest } = await import("./request-meta.server");
    const ip = clientIpFromRequest();
    const nowIso = new Date().toISOString();
    const current = await sql<{ last_ip: string | null; ip_history: string | null }>`
      select last_ip, ip_history::text as ip_history from profiles where user_id = ${context.userId}
    `;
    const history = parseIpHistory(
      current[0]?.ip_history ? JSON.parse(current[0].ip_history) : null,
      current[0]?.last_ip ?? null,
    );
    const rotated = rotateIpHistory(history, ip, nowIso);
    await sql`
      update profiles
      set last_seen_at = now(), last_ip = ${ip}, ip_history = ${JSON.stringify(rotated)}::jsonb
      where user_id = ${context.userId}
    `;
    return { ok: true as const };
  });
