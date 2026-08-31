import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Panel } from "@/components/page-shell";

export const Route = createFileRoute("/ia")({ component: IA });

function IA() {
  return (
    <PageShell title="Inteligencia Artificial" kicker="Agentes">
      <Panel>
        <p className="text-sm text-muted">Catálogo previsto. Ciberbot entra por API con un pase de admin, no con tu contraseña.</p>
      </Panel>
    </PageShell>
  );
}
