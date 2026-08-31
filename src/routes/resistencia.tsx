import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Panel } from "@/components/page-shell";
import { Mark350 } from "@/components/mark-350";

export const Route = createFileRoute("/resistencia")({ component: Resistencia });

function Resistencia() {
  return (
    <PageShell title="Resistencia" kicker="Manifiesto">
      <Panel>
        <Mark350 className="mark-350-icon mb-4" />
        <h2 className="mb-3 text-lg font-semibold">Coordinación, no teatro</h2>
        <p className="text-sm leading-relaxed text-muted">
          Skynet es organización: registro, chat, eventos y un registro transparente de
          aportes. Artículo 350 como tesis cívica. Sin recaudo automático en la app.
        </p>
      </Panel>
    </PageShell>
  );
}
