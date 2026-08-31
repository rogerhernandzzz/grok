import { useEffect, useRef, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";
import {
  deleteGeneralChat,
  listChatPeople,
  listDirectChat,
  listGeneralChat,
  sendDirectChat,
  sendGeneralChat,
  type ChatLine,
  type ChatPerson,
} from "@/lib/server/chat";
import { ensureMyProfile, getAdminStatus, getMyProfile, setMemberMuted, setMemberStars } from "@/lib/server/profiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/page-shell";
import { Stars } from "@/components/stars";

export const Route = createFileRoute("/comunidad")({ component: Comunidad });

function fmtTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("es", { hour: "numeric", minute: "2-digit" });
}

function Comunidad() {
  const { user, isPending } = useCurrentUserState();
  const [people, setPeople] = useState<ChatPerson[]>([]);
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [ready, setReady] = useState(false);
  const [peer, setPeer] = useState<ChatPerson | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [muted, setMuted] = useState(false);
  const [myStars, setMyStars] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const peerRef = useRef<ChatPerson | null>(null);
  const userId = user?.id;
  peerRef.current = peer;

  async function loadBoard(nextPeer: ChatPerson | null) {
    try {
      if (nextPeer) {
        const rows = await listDirectChat({ data: { peerId: nextPeer.userId } });
        if (peerRef.current?.userId !== nextPeer.userId) return;
        setLines(rows);
      } else {
        const rows = await listGeneralChat();
        if (peerRef.current) return;
        setLines(rows.map((row) => ({ ...row, mine: row.userId === userId })));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "El chat no cargó");
    } finally {
      setReady(true);
    }
  }

  useEffect(() => {
    if (!userId) return;
    let stop = false;
    let busy = false;
    void ensureMyProfile().catch(() => undefined);
    void loadBoard(peer);

    async function tick() {
      if (busy || stop) return;
      busy = true;
      try {
        const [status, me, roster] = await Promise.all([
          getAdminStatus().catch(() => ({ isAdmin: false, adminCount: 0 })),
          getMyProfile().catch(() => null),
          listChatPeople().catch(() => []),
        ]);
        if (stop) return;
        setIsAdmin(status.isAdmin);
        if (me) {
          setMuted(me.muted);
          setMyStars(me.stars);
        }
        setPeople(roster);
        await loadBoard(peerRef.current);
      } catch (err) {
        if (!stop) setError(err instanceof Error ? err.message : "El chat no cargó");
      } finally {
        busy = false;
      }
    }

    const id = window.setInterval(() => void tick(), 2500);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, peer?.userId]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [lines.length]);

  if (isPending) {
    return (
      <PageShell title="Comunicación" kicker="Chat">
        <div className="h-40 animate-pulse rounded-xl bg-surface" />
      </PageShell>
    );
  }
  if (!user) return <RedirectToSignIn />;

  const online = people.filter((p) => p.online);
  const offline = people.filter((p) => !p.online);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setError(null);
    setDraft("");
    try {
      if (peer) {
        await sendDirectChat({ data: { peerId: peer.userId, body } });
        await loadBoard(peer);
      } else {
        await sendGeneralChat({ data: { body } });
        await loadBoard(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar");
    }
  }

  return (
    <PageShell title="Comunicación" kicker="Chat">
      {muted ? <p className="mb-3 text-sm text-accent">Estás silenciado en el chat público.</p> : null}
      {error ? <p className="mb-3 text-sm text-accent">{error}</p> : null}
      <div className="chat-shell">
        <aside className="chat-people">
          <button type="button" className={`chat-person ${peer ? "" : "is-on"}`} onClick={() => setPeer(null)}>
            <span className="presence-dot is-on" />
            <span className="text-sm">General</span>
          </button>
          <p className="mt-3 mb-1 font-mono text-[10px] tracking-widest uppercase text-subtle">En línea</p>
          {online.map((p) => (
            <button key={p.userId} type="button" className={`chat-person ${peer?.userId === p.userId ? "is-on" : ""}`} onClick={() => setPeer(p)}>
              <span className={`presence-dot ${p.online ? "is-on" : ""}`} />
              <span className="text-sm">{p.displayName}</span>
              <Stars n={p.stars} />
              {p.muted ? <span className="font-mono text-[10px] text-accent">silencio</span> : null}
            </button>
          ))}
          <p className="mt-3 mb-1 font-mono text-[10px] tracking-widest uppercase text-subtle">Fuera</p>
          {offline.map((p) => (
            <button key={p.userId} type="button" className={`chat-person ${peer?.userId === p.userId ? "is-on" : ""}`} onClick={() => setPeer(p)}>
              <span className="presence-dot" />
              <span className="text-sm">{p.displayName}</span>
              <Stars n={p.stars} />
            </button>
          ))}
        </aside>
        <section className="chat-board">
          <div className="border-b border-border px-4 py-3">
            <div className="text-sm font-medium">{peer ? peer.displayName : "General"}</div>
            {peer ? <Stars n={peer.stars} /> : <span className="text-xs text-muted">Chat público</span>}
          </div>
          <div className="chat-lines" ref={scroller}>
            {!ready ? (
              <p className="text-sm text-muted">Cargando…</p>
            ) : lines.length === 0 ? (
              <p className="text-sm text-muted">No hay mensajes aquí.</p>
            ) : (
              lines.map((line) => (
                <div key={line.id} className={`chat-line ${line.mine ? "is-mine" : "is-theirs"}`}>
                  <div className="chat-bubble">
                    <div>{line.body}</div>
                    <div className="chat-meta">{fmtTime(line.createdAt)}</div>
                  </div>
                  <span className="chat-name">
                    {line.mine ? "Tú" : line.authorName} <Stars n={line.mine ? myStars : line.stars} />
                  </span>
                  {!peer && (line.mine || isAdmin) ? (
                    <div className="chat-admin">
                      <button
                        type="button"
                        onClick={() =>
                          void deleteGeneralChat({ data: { id: line.id } }).then(() =>
                            setLines((cur) => cur.filter((item) => item.id !== line.id)),
                          )
                        }
                      >
                        Borrar
                      </button>
                      {isAdmin && !line.mine ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              void setMemberMuted({ data: { userId: line.userId, muted: !line.muted } }).then(() =>
                                loadBoard(null),
                              )
                            }
                          >
                            {line.muted ? "Quitar silencio" : "Silenciar"}
                          </button>
                          {[0, 1, 2, 3].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => void setMemberStars({ data: { userId: line.userId, stars: n } }).then(() => loadBoard(null))}
                            >
                              {n === 0 ? "0★" : `${n}★`}
                            </button>
                          ))}
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
          <form className="chat-composer" onSubmit={(e) => void onSend(e)}>
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={peer ? `Privado a ${peer.displayName}…` : muted ? "Silenciado" : "Mensaje al general…"}
              disabled={!peer && muted}
            />
            <Button type="submit" disabled={!peer && muted}>
              Enviar
            </Button>
          </form>
        </section>
      </div>
    </PageShell>
  );
}
