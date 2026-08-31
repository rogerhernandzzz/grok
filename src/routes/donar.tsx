import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Panel } from "@/components/page-shell";
import { getPublicStats, listDonations, listExpenses } from "@/lib/server/content";

export const Route = createFileRoute("/donar")({ component: Donar });

function money(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Donar() {
  const [stats, setStats] = useState({ raised: 0, spent: 0, available: 0 });
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listDonations>>>([]);
  const [expenses, setExpenses] = useState<Awaited<ReturnType<typeof listExpenses>>>([]);
  useEffect(() => {
    void getPublicStats().then(setStats).catch(() => undefined);
    void listDonations().then(setRows).catch(() => setRows([]));
    void listExpenses().then(setExpenses).catch(() => setExpenses([]));
  }, []);
  return (
    <PageShell title="Aportar" kicker="Transparencia">
      <div className="space-y-4">
        <Panel>
          <p className="font-mono text-[11px] tracking-widest uppercase text-muted">Caja pública</p>
          <p className="mt-2 font-mono text-2xl">Disponible ${money(stats.available)}</p>
          <p className="mt-2 text-sm text-muted">Recaudado ${money(stats.raised)} · Gastado ${money(stats.spent)}. No hay pasarela de pagos aquí.</p>
        </Panel>
        <Panel>
          <h2 className="mb-3 text-lg font-semibold">Aportes</h2>
          {rows.length === 0 ? <p className="text-sm text-muted">Sin aportes verificados.</p> : rows.map((row) => (
            <div key={row.id} className="flex justify-between py-2 text-sm"><span>${Number(row.amount).toFixed(2)} · {row.method}</span><span className="font-mono text-xs text-subtle">{row.created_at.slice(0, 10)}</span></div>
          ))}
        </Panel>
        <Panel>
          <h2 className="mb-3 text-lg font-semibold">Gastos</h2>
          {expenses.length === 0 ? <p className="text-sm text-muted">Sin egresos.</p> : expenses.map((row) => (
            <div key={row.id} className="flex justify-between py-2 text-sm"><span>{row.concept} −${Number(row.amount).toFixed(2)}</span><span className="font-mono text-xs text-subtle">{row.created_at.slice(0, 10)}</span></div>
          ))}
        </Panel>
      </div>
    </PageShell>
  );
}
