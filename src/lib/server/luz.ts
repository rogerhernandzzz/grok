import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { requireAdmin } from "./profiles";

export type LuzPeer = { userId: string; displayName: string };
export type LuzMove = {
  id: number;
  amount: number;
  kind: "emit" | "transfer";
  fromName: string;
  toName: string;
  note: string | null;
  createdAt: string;
  incoming: boolean;
};

function num(value: unknown) {
  return Number(value) || 0;
}

export const getLuzBalance = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ luz: string }>`
      select luz::text as luz from profiles where user_id = ${context.userId} limit 1
    `;
    return { luz: num(rows[0]?.luz) };
  });

export const listLuzPeers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ user_id: string; display_name: string }>`
      select user_id, display_name from profiles
      where user_id <> ${context.userId}
      order by display_name asc
    `;
    return rows.map((row) => ({ userId: row.user_id, displayName: row.display_name || "Miembro" })) satisfies LuzPeer[];
  });

export const listLuzHistory = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      amount: string;
      kind: string;
      from_user: string | null;
      to_user: string;
      from_name: string | null;
      to_name: string | null;
      note: string | null;
      created_at: string;
    }>`
      select
        l.id,
        l.amount::text as amount,
        l.kind,
        l.from_user,
        l.to_user,
        f.display_name as from_name,
        t.display_name as to_name,
        l.note,
        l.created_at::text as created_at
      from luz_ledger l
      left join profiles f on f.user_id = l.from_user
      left join profiles t on t.user_id = l.to_user
      where l.from_user = ${context.userId} or l.to_user = ${context.userId}
      order by l.created_at desc
      limit 40
    `;
    return rows.map((row) => ({
      id: row.id,
      amount: num(row.amount),
      kind: row.kind === "emit" ? "emit" : "transfer",
      fromName: row.kind === "emit" ? "Admin" : row.from_name || "Miembro",
      toName: row.to_name || "Miembro",
      note: row.note,
      createdAt: row.created_at,
      incoming: row.to_user === context.userId,
    })) satisfies LuzMove[];
  });

export const emitLuz = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      userId: z.string().min(1).max(80),
      amount: z.number().positive().max(1_000_000_000),
      note: z.string().trim().max(140).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const amount = Math.round(data.amount * 100) / 100;
    const sql = await getSql();
    const dest = await sql<{ user_id: string }>`select user_id from profiles where user_id = ${data.userId} limit 1`;
    if (!dest[0]) throw new Error("Ese miembro no existe");
    await sql`update profiles set luz = luz + ${amount} where user_id = ${data.userId}`;
    await sql`
      insert into luz_ledger (from_user, to_user, amount, kind, note)
      values (${context.userId}, ${data.userId}, ${amount}, ${"emit"}, ${data.note ?? null})
    `;
    return { ok: true as const, amount };
  });

export const transferLuz = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      userId: z.string().min(1).max(80),
      amount: z.number().positive().max(1_000_000_000),
      note: z.string().trim().max(140).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    if (data.userId === context.userId) throw new Error("No puedes enviarte LUZ a ti mismo");
    const amount = Math.round(data.amount * 100) / 100;
    const sql = await getSql();
    const dest = await sql<{ user_id: string }>`select user_id from profiles where user_id = ${data.userId} limit 1`;
    if (!dest[0]) throw new Error("Ese miembro no existe");
    const debit = await sql<{ user_id: string }>`
      update profiles
      set luz = luz - ${amount}
      where user_id = ${context.userId} and luz >= ${amount}
      returning user_id
    `;
    if (!debit[0]) throw new Error("Saldo insuficiente");
    await sql`update profiles set luz = luz + ${amount} where user_id = ${data.userId}`;
    await sql`
      insert into luz_ledger (from_user, to_user, amount, kind, note)
      values (${context.userId}, ${data.userId}, ${amount}, ${"transfer"}, ${data.note ?? null})
    `;
    const bal = await sql<{ luz: string }>`select luz::text as luz from profiles where user_id = ${context.userId}`;
    return { ok: true as const, luz: num(bal[0]?.luz) };
  });
