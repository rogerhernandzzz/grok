import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { ensureMyProfile, getMyProfile, updateMyDisplayName } from "@/lib/server/profiles";
import { listMyMessages } from "@/lib/server/content";
import { getLuzBalance, listLuzHistory, listLuzPeers, transferLuz, type LuzMove, type LuzPeer } from "@/lib/server/luz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell, Panel } from "@/components/page-shell";
import { Stars } from "@/components/stars";

export const Route = createFileRoute("/panel")({ component: PanelPage });

function fmtLuz(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function PanelPage() {
  const { user, isPending } = useCurrentUserState();
  const [name, setName] = useState("");
  const [stars, setStars] = useState(0);
  const [muted, setMuted] = useState(false);
  const [luz, setLuz] = useState(0);
  const [peers, setPeers] = useState<LuzPeer[]>([]);
  const [history, setHistory] = useState<LuzMove[]>([]);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Awaited<ReturnType<typeof listMyMessages>>>([]);
  const [saved, setSaved] = useState(false);
  const [sent, setSent] = useState(false);

  async function loadMoney() {
    const [bal, roster, moves] = await Promise.all([getLuzBalance(), listLuzPeers(), listLuzHistory()]);
    setLuz(bal.luz);
    setPeers(roster);
    setHistory(moves);
    if (!to && roster[0]) setTo(roster[0].userId);
  }

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void (async () => {
      try {
        await ensureMyProfile();
        const p = await getMyProfile();
        const box = await listMyMessages();
        if (cancelled) return;
        setName(p.displayName);
        setStars(p.stars);
        setMuted(p.muted);
        setMessages(box);
        await loadMoney();
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "No se pudo cargar el panel");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (isPending) {
    return (
      <PageShell title="Mi panel">
        <div className="h-40 animate-pulse rounded-xl bg-surface" />
      </PageShell>
    );
  }
  if (!user) return <RedirectToSignIn />;

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await updateMyDisplayName({ data: { displayName: name } });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    }
  }

  async function onSend(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSent(false);
    try {
      const next = await transferLuz({ data: { userId: to, amount: Number(amount), note: note || undefined } });
      setLuz(next.luz);
      setAmount("");
      setNote("");
      setSent(true);
      setHistory(await listLuzHistory());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar");
    }
  }

  return (
    <PageShell title="Mi panel" kicker="Cuenta">
      <div className="space-y-4">
        {error ? <p className="text-sm text-accent">{error}</p> : null}
        <Panel>
          <form className="space-y-3" onSubmit={(e) => void onSave(e)}>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu alias" />
            <div className="text-sm text-muted">
              Rango <Stars n={stars} /> {muted ? "· silenciado" : ""}
            </div>
            <Button type="submit">Guardar alias</Button>
            {saved ? <p className="text-sm text-ok">Guardado.</p> : null}
          </form>
        </Panel>
        <Panel>
          <p className="font-mono text-[11px] tracking-widest uppercase text-muted">Saldo LUZ</p>
          <p className="mt-2 font-mono text-3xl">{fmtLuz(luz)}</p>
          <p className="mt-2 text-sm text-muted">Moneda de la app. El admin la emite. Tú puedes enviarla a otros miembros.</p>
          {peers.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No hay otros miembros todavía.</p>
          ) : (
            <form className="mt-4 space-y-3" onSubmit={(e) => void onSend(e)}>
              <select
                className="h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              >
                {peers.map((p) => (
                  <option key={p.userId} value={p.userId}>
                    {p.displayName}
                  </option>
                ))}
              </select>
              <Input type="number" min="0.01" step="0.01" placeholder="Cantidad" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              <Input placeholder="Nota (opcional)" value={note} onChange={(e) => setNote(e.target.value)} />
              <Button type="submit">Enviar LUZ</Button>
              {sent ? <p className="text-sm text-ok">Enviado.</p> : null}
            </form>
          )}
          {history.length > 0 ? (
            <ul className="mt-5 divide-y divide-border">
              {history.map((m) => (
                <li key={m.id} className="flex justify-between gap-3 py-2 text-sm">
                  <span>
                    {m.incoming ? `De ${m.fromName}` : `A ${m.toName}`}
                    {m.note ? ` · ${m.note}` : ""}
                  </span>
                  <span className={`font-mono ${m.incoming ? "text-ok" : "text-muted"}`}>
                    {m.incoming ? "+" : "−"}
                    {fmtLuz(m.amount)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </Panel>
        <Panel>
          <h2 className="mb-3 text-lg font-semibold">Buzón</h2>
          {messages.length === 0 ? (
            <p className="text-sm text-muted">Sin mensajes.</p>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="py-2">
                <div className="text-sm font-medium">{m.title}</div>
                <p className="text-sm text-muted">{m.body}</p>
              </div>
            ))
          )}
        </Panel>
      </div>
    </PageShell>
  );
}
