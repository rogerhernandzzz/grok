import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { requireAdmin } from "./profiles";

export type ChatPerson = {
  userId: string;
  displayName: string;
  online: boolean;
  unread: number;
  muted: boolean;
  stars: number;
};

export type ChatLine = {
  id: number;
  userId: string;
  authorName: string;
  body: string;
  createdAt: string;
  mine: boolean;
  stars: number;
  muted: boolean;
};

function isOn(value: unknown) {
  return value === true || String(value) === "t";
}

export const listChatPeople = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      user_id: string;
      display_name: string;
      online: boolean;
      unread: number;
      muted: boolean;
      stars: number;
    }>`
      select
        p.user_id,
        p.display_name,
        (p.last_seen_at is not null and p.last_seen_at > now() - interval '90 seconds') as online,
        (
          select count(*)::int from dm_messages d
          where d.from_user = p.user_id
            and d.to_user = ${context.userId}
            and d.read = false
        ) as unread,
        p.muted,
        p.stars
      from profiles p
      where p.user_id <> ${context.userId}
      order by
        (p.last_seen_at is not null and p.last_seen_at > now() - interval '90 seconds') desc,
        p.display_name asc
    `;
    return rows.map((row) => ({
      userId: row.user_id,
      displayName: row.display_name,
      online: isOn(row.online),
      unread: Number(row.unread) || 0,
      muted: isOn(row.muted),
      stars: Math.min(3, Math.max(0, Number(row.stars) || 0)),
    })) satisfies ChatPerson[];
  });

export const listGeneralChat = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{
    id: number;
    user_id: string;
    author_name: string;
    content: string;
    created_at: string;
    stars: number;
    muted: boolean;
  }>`
    select
      f.id, f.user_id, f.author_name, f.content, f.created_at::text as created_at,
      coalesce(p.stars, 0) as stars,
      coalesce(p.muted, false) as muted
    from (
      select id, user_id, author_name, content, created_at
      from forum_posts
      order by created_at desc
      limit 120
    ) f
    left join profiles p on p.user_id = f.user_id
    order by f.created_at asc
  `;
  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    authorName: row.author_name,
    body: row.content,
    createdAt: row.created_at,
    mine: false,
    stars: Math.min(3, Math.max(0, Number(row.stars) || 0)),
    muted: isOn(row.muted),
  })) satisfies ChatLine[];
});

export const sendGeneralChat = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ body: z.string().trim().min(1).max(1200) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const me = await sql<{ display_name: string; muted: boolean }>`
      select display_name, muted from profiles where user_id = ${context.userId} limit 1
    `;
    if (isOn(me[0]?.muted)) throw new Error("Estás silenciado en el chat público");
    const name = me[0]?.display_name?.trim() || "Miembro";
    const rows = await sql<{ id: number; created_at: string }>`
      insert into forum_posts (user_id, author_name, content)
      values (${context.userId}, ${name}, ${data.body})
      returning id, created_at::text as created_at
    `;
    return { id: rows[0]?.id ?? 0, createdAt: rows[0]?.created_at ?? new Date().toISOString() };
  });

export const deleteGeneralChat = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.number().int().positive() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ user_id: string }>`select user_id from forum_posts where id = ${data.id} limit 1`;
    if (!rows[0]) throw new Error("El mensaje ya no está");
    if (rows[0].user_id !== context.userId) await requireAdmin(context.userId);
    await sql`delete from forum_posts where id = ${data.id}`;
    return { ok: true as const };
  });

export const listDirectChat = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ peerId: z.string().min(1).max(80) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      from_user: string;
      author_name: string;
      body: string;
      created_at: string;
    }>`
      select id, from_user, author_name, body, created_at::text as created_at
      from dm_messages
      where
        (from_user = ${context.userId} and to_user = ${data.peerId})
        or (from_user = ${data.peerId} and to_user = ${context.userId})
      order by created_at asc
      limit 200
    `;
    await sql`
      update dm_messages
      set read = true
      where from_user = ${data.peerId} and to_user = ${context.userId} and read = false
    `;
    return rows.map((row) => ({
      id: row.id,
      userId: row.from_user,
      authorName: row.author_name,
      body: row.body,
      createdAt: row.created_at,
      mine: row.from_user === context.userId,
      stars: 0,
      muted: false,
    })) satisfies ChatLine[];
  });

export const sendDirectChat = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      peerId: z.string().min(1).max(80),
      body: z.string().trim().min(1).max(1200),
    }),
  )
  .handler(async ({ context, data }) => {
    if (data.peerId === context.userId) throw new Error("No puedes escribirte a ti mismo");
    const sql = await getSql();
    const me = await sql<{ display_name: string }>`
      select display_name from profiles where user_id = ${context.userId} limit 1
    `;
    const name = me[0]?.display_name?.trim() || "Miembro";
    await sql`
      insert into dm_messages (from_user, to_user, author_name, body)
      values (${context.userId}, ${data.peerId}, ${name}, ${data.body})
    `;
    return { ok: true as const };
  });
