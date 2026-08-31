import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { requireAdmin } from "./profiles";

export const getPublicStats = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const members = await sql<{ n: number }>`select count(*)::int as n from profiles`;
  const raised = await sql<{ total: string }>`
    select coalesce(sum(amount), 0)::text as total from donations where status = ${"verified"}
  `;
  const spent = await sql<{ total: string }>`select coalesce(sum(amount), 0)::text as total from expenses`;
  const recent = await sql<{ display_name: string; created_at: string }>`
    select display_name, created_at::text as created_at from profiles order by created_at desc limit 8
  `;
  const r = Number(raised[0]?.total ?? 0);
  const s = Number(spent[0]?.total ?? 0);
  return {
    members: members[0]?.n ?? 0,
    raised: r,
    spent: s,
    available: r - s,
    recent: recent.map((row) => ({ displayName: row.display_name?.trim() || "Miembro", joinedAt: row.created_at })),
  };
});

export const listNews = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<{ id: number; title: string; body: string; tag: string; created_at: string }>`
    select id, title, body, tag, created_at::text as created_at from news order by created_at desc limit 20
  `;
});

export const createNews = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ title: z.string().trim().min(2).max(120), body: z.string().trim().min(2).max(4000), tag: z.string().trim().min(1).max(32) }))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    await sql`insert into news (title, body, tag, author_id) values (${data.title}, ${data.body}, ${data.tag}, ${context.userId})`;
    return { ok: true as const };
  });

export const listDonations = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<{ id: number; amount: string; method: string; note: string | null; created_at: string }>`
    select id, amount::text as amount, method, note, created_at::text as created_at
    from donations where status = ${"verified"} order by created_at desc limit 40
  `;
});

export const recordDonation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ amount: z.number().positive().max(1_000_000), method: z.enum(["transferencia", "crypto", "efectivo", "otro"]), note: z.string().trim().max(240).optional() }))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    await sql`insert into donations (amount, method, note, recorded_by, status) values (${data.amount}, ${data.method}, ${data.note ?? null}, ${context.userId}, ${"verified"})`;
    return { ok: true as const };
  });

export const listExpenses = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<{ id: number; amount: string; concept: string; note: string | null; created_at: string }>`
    select id, amount::text as amount, concept, note, created_at::text as created_at from expenses order by created_at desc limit 40
  `;
});

export const recordExpense = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ amount: z.number().positive().max(1_000_000), concept: z.string().trim().min(2).max(80), note: z.string().trim().max(240).optional() }))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    await sql`insert into expenses (amount, concept, note, recorded_by) values (${data.amount}, ${data.concept}, ${data.note ?? null}, ${context.userId})`;
    return { ok: true as const };
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ userId: z.string().min(1), title: z.string().trim().min(1).max(80), body: z.string().trim().min(1).max(2000) }))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    await sql`insert into messages (user_id, title, body) values (${data.userId}, ${data.title}, ${data.body})`;
    return { ok: true as const };
  });

export const listMyMessages = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{ id: number; title: string; body: string; read: boolean; created_at: string }>`
      select id, title, body, read, created_at::text as created_at from messages where user_id = ${context.userId} order by created_at desc limit 40
    `;
  });
