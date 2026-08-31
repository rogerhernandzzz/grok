import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, Panel } from "@/components/page-shell";

export const Route = createFileRoute("/cripto")({ component: Cripto });

function Cripto() {
  return (
    <PageShell title="LUZ" kicker="Moneda interna">
      <div className="space-y-4">
        <Panel>
          <p className="text-sm leading-relaxed text-muted">
            LUZ es la moneda de Skynet, no una cripto ni un mercado. El
            administrador la emite. Los miembros se la envían entre sí desde el
            panel. No se compra con dinero.
          </p>
        </Panel>
        <Panel>
          <Link to="/panel" className="text-sm underline underline-offset-4 hover:text-accent">
            Ir al panel para ver tu saldo y transferir
          </Link>
        </Panel>
      </div>
    </PageShell>
  );
}
