import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";
import {
  claimFirstAdmin,
  getAdminStatus,
  listMembers,
  setMemberMuted,
  setMemberRole,
  setMemberStars,
  type AdminMember,
} from "@/lib/server/profiles";
import { createNews, recordDonation, recordExpense, sendMessage } from "@/lib/server/content";
import { emitLuz } from "@/lib/server/luz";
import { listVisitors, type SiteVisitor } from "@/lib/server/visitors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageShell, Panel } from "@/components/page-shell";
import { Stars } from "@/components/stars";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function formatSeen(iso: string | null) {
  if (!iso) return "Nunca";
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  return `Hace ${Math.round(minutes / 60)} h`;
}

type Tab = "monitor" | "noticias" | "aportes" | "gastos" | "mensajes" | "luz";

function AdminPage() {
  const { user, isPending } = useCurrentUserState();
  const [status, setStatus] = useState<Awaited<ReturnType<typeof getAdminStatus>> | null>(null);
  const [tab, setTab] = useState<Tab>("monitor");
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [visitors, setVisitors] = useState<SiteVisitor[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const next = await getAdminStatus();
    setStatus(next);
    if (next.isAdmin) {
      setMembers(await listMembers());
      setVisitors(await listVisitors());
    }
  }

  useEffect(() => {
    if (!user) return;
    void refresh().catch((err) => setError(err instanceof Error ? err.message : "Error"));
  }, [user]);

  useEffect(() => {
    if (!user || tab !== "monitor") return;
    const id = window.setInterval(() => {
      void listMembers().then(setMembers).catch(() => undefined);
      void listVisitors().then(setVisitors).catch(() => undefined);
    }, 5000);
    return () => window.clearInterval(id);
  }, [user, tab]);

  if (isPending) return <PageShell title="Administración" kicker="Servidor"><div className="h-40 animate-pulse rounded-xl bg-surface" /></PageShell>;
  if (!user) return <RedirectToSignIn />;
  if (!status) return <PageShell title="Administración"><Panel>{error ?? "Cargando…"}</Panel></PageShell>;

  if (!status.isAdmin && status.adminCount === 0) {
    return (
      <PageShell title="Administración" kicker="Arranque">
        <Panel className="space-y-4">
          <p className="text-sm text-muted">No hay administradores. Reclama el rol.</p>
          <Button onClick={() => void claimFirstAdmin().then(() => refresh()).catch((err) => setError(err instanceof Error ? err.message : "Error"))}>
            Convertirme en administrador
          </Button>
          {error ? <p className="text-sm text-accent">{error}</p> : null}
        </Panel>
      </PageShell>
    );
  }
  if (!status.isAdmin) {
    return (
      <PageShell title="Administración" kicker="Acceso denegado">
        <Panel><p className="text-sm text-muted">Solo un admin verificado.</p></Panel>
      </PageShell>
    );
  }

  return (
    <PageShell title="Administración" kicker="Monitoreo" wide>
      <div className="mb-6 flex flex-wrap gap-2">
        {([["monitor", "Monitor"], ["noticias", "Noticias"], ["aportes", "Aportes"], ["gastos", "Gastos"], ["mensajes", "Mensajes"], ["luz", "LUZ"]] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`h-9 rounded-sm border px-3 font-mono text-[11px] tracking-widest uppercase ${tab === id ? "border-accent text-accent" : "border-border text-muted"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {notice ? <p className="mb-4 text-sm text-ok">{notice}</p> : null}
      {error ? <p className="mb-4 text-sm text-accent">{error}</p> : null}

      {tab === "monitor" ? (
        <div className="monitor-grid">
          <Panel className="monitor-col">
            <h2 className="mb-3 text-lg font-semibold">Usuarios</h2>
            <ul className="divide-y divide-border">
              {members.map((m) => (
                <li key={m.userId} className="py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`presence-dot ${m.online ? "is-on" : ""}`} />
                    <span className="text-sm font-medium">{m.displayName}</span>
                    <Stars n={m.stars} />
                    {m.muted ? <span className="font-mono text-xs text-accent">silencio</span> : null}
                    <span className="font-mono text-xs uppercase text-subtle">{m.role}</span>
                    <span className="font-mono text-xs text-muted">{Number(m.luz).toFixed(0)} LUZ</span>
                  </div>
                  {m.userId !== user.id ? (
                    <div className="chat-admin mt-2">
                      <button type="button" onClick={() => void setMemberMuted({ data: { userId: m.userId, muted: !m.muted } }).then(() => refresh())}>
                        {m.muted ? "Quitar silencio" : "Silenciar"}
                      </button>
                      {[0, 1, 2, 3].map((n) => (
                        <button key={n} type="button" onClick={() => void setMemberStars({ data: { userId: m.userId, stars: n } }).then(() => refresh())}>
                          {n}★
                        </button>
                      ))}
                      <button type="button" onClick={() => void setMemberRole({ data: { userId: m.userId, role: m.role === "admin" ? "member" : "admin" } }).then(() => refresh())}>
                        {m.role === "admin" ? "Quitar admin" : "Hacer admin"}
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel className="monitor-col">
            <h2 className="mb-3 text-lg font-semibold">Tráfico</h2>
            {visitors.length === 0 ? <p className="text-sm text-muted">Nadie aún.</p> : (
              <ul className="divide-y divide-border">
                {visitors.map((v) => (
                  <li key={v.id} className="py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`presence-dot ${v.online ? "is-on" : ""}`} />
                      <span className="text-sm">{v.label}</span>
                    </div>
                    <div className="font-mono text-xs text-muted">{v.online ? "Ahora" : formatSeen(v.lastSeenAt)} {v.lastPath ? `· ${v.lastPath}` : ""}</div>
                    <ol className="ip-history">
                      {(["Actual", "Anterior", "Previa"] as const).map((label, i) => (
                        <li key={label}><span>{label}</span><code>{v.ips[i]?.ip ?? "—"}</code></li>
                      ))}
                    </ol>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      ) : null}

      {tab === "noticias" ? (
        <NewsForm onDone={() => setNotice("Publicado")} onError={setError} />
      ) : null}
      {tab === "aportes" ? (
        <DonationForm onDone={() => setNotice("Aporte registrado")} onError={setError} />
      ) : null}
      {tab === "gastos" ? (
        <ExpenseForm onDone={() => setNotice("Gasto registrado")} onError={setError} />
      ) : null}
      {tab === "mensajes" ? (
        <MessageForm members={members} onDone={() => setNotice("Enviado")} onError={setError} />
      ) : null}
      {tab === "luz" ? (
        <LuzForm members={members} onDone={() => { setNotice("LUZ emitida"); void refresh(); }} onError={setError} />
      ) : null}
    </PageShell>
  );
}

function NewsForm({ onDone, onError }: { onDone: () => void; onError: (m: string) => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await createNews({ data: { title, body, tag: "evento" } });
      setTitle("");
      setBody("");
      onDone();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error");
    }
  }
  return (
    <Panel>
      <form className="space-y-3" onSubmit={(e) => void onSubmit(e)}>
        <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Textarea placeholder="Contenido" value={body} onChange={(e) => setBody(e.target.value)} required />
        <Button type="submit">Publicar</Button>
      </form>
    </Panel>
  );
}

function DonationForm({ onDone, onError }: { onDone: () => void; onError: (m: string) => void }) {
  const [amount, setAmount] = useState("0");
  const [note, setNote] = useState("");
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await recordDonation({ data: { amount: Number(amount), method: "transferencia", note: note || undefined } });
      onDone();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error");
    }
  }
  return (
    <Panel>
      <form className="space-y-3" onSubmit={(e) => void onSubmit(e)}>
        <Input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <Input placeholder="Nota" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button type="submit">Registrar aporte</Button>
      </form>
    </Panel>
  );
}

function ExpenseForm({ onDone, onError }: { onDone: () => void; onError: (m: string) => void }) {
  const [amount, setAmount] = useState("0");
  const [concept, setConcept] = useState("");
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await recordExpense({ data: { amount: Number(amount), concept } });
      onDone();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error");
    }
  }
  return (
    <Panel>
      <form className="space-y-3" onSubmit={(e) => void onSubmit(e)}>
        <Input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <Input placeholder="Concepto" value={concept} onChange={(e) => setConcept(e.target.value)} required />
        <Button type="submit">Registrar gasto</Button>
      </form>
    </Panel>
  );
}

function MessageForm({ members, onDone, onError }: { members: AdminMember[]; onDone: () => void; onError: (m: string) => void }) {
  const [userId, setUserId] = useState(members[0]?.userId ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await sendMessage({ data: { userId, title, body } });
      onDone();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error");
    }
  }
  return (
    <Panel>
      <form className="space-y-3" onSubmit={(e) => void onSubmit(e)}>
        <select className="h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm" value={userId} onChange={(e) => setUserId(e.target.value)}>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>{m.displayName}</option>
          ))}
        </select>
        <Input placeholder="Asunto" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Textarea placeholder="Mensaje" value={body} onChange={(e) => setBody(e.target.value)} required />
        <Button type="submit">Enviar</Button>
      </form>
    </Panel>
  );
}

function LuzForm({ members, onDone, onError }: { members: AdminMember[]; onDone: () => void; onError: (m: string) => void }) {
  const [userId, setUserId] = useState(members[0]?.userId ?? "");
  const [amount, setAmount] = useState("100");
  const [note, setNote] = useState("");
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await emitLuz({ data: { userId, amount: Number(amount), note: note || undefined } });
      setNote("");
      onDone();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error");
    }
  }
  return (
    <Panel>
      <p className="mb-4 text-sm text-muted">
        Emite LUZ a un miembro. Se crea en la app, no se compra. Ellos pueden
        enviársela entre sí desde el panel.
      </p>
      <form className="space-y-3" onSubmit={(e) => void onSubmit(e)}>
        <select className="h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm" value={userId} onChange={(e) => setUserId(e.target.value)}>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.displayName} · {Number(m.luz).toFixed(0)} LUZ
            </option>
          ))}
        </select>
        <Input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <Input placeholder="Nota (opcional)" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button type="submit">Emitir LUZ</Button>
      </form>
    </Panel>
  );
}
