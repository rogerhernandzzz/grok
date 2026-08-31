import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/verify.server";

export type Notice = { id: string; title: string; body: string; createdAt: string };

export const listNotices = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const news = await sql<{ id: number; title: string; body: string; created_at: string }>`
    select id, title, body, created_at::text as created_at from news order by created_at desc limit 12
  `;
  const items: Notice[] = news.map((row) => ({
    id: `n-${row.id}`,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
  }));
  const session = await getSessionUser();
  if (session?.id) {
    const notes = await sql<{ id: number; title: string; body: string; created_at: string }>`
      select id, title, body, created_at::text as created_at
      from messages where user_id = ${session.id} order by created_at desc limit 12
    `;
    for (const row of notes) {
      items.push({ id: `m-${row.id}`, title: row.title, body: row.body, createdAt: row.created_at });
    }
  }
  items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return items.slice(0, 16);
});
