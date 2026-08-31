import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Panel } from "@/components/page-shell";
import { listNews } from "@/lib/server/content";

export const Route = createFileRoute("/eventos")({ component: Eventos });

function Eventos() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listNews>>>([]);
  useEffect(() => {
    void listNews().then(setRows).catch(() => setRows([]));
  }, []);
  return (
    <PageShell title="Eventos" kicker="Noticias">
      {rows.length === 0 ? (
        <Panel><p className="text-sm text-muted">Aún no hay avisos.</p></Panel>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <Panel key={row.id}>
              <p className="font-mono text-[11px] uppercase text-accent">{row.tag}</p>
              <h2 className="mt-1 text-lg font-semibold">{row.title}</h2>
              <p className="mt-2 text-sm text-muted">{row.body}</p>
            </Panel>
          ))}
        </div>
      )}
    </PageShell>
  );
}
