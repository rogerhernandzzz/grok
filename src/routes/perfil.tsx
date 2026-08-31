import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Panel } from "@/components/page-shell";

export const Route = createFileRoute("/perfil")({ component: Perfil });

function Perfil() {
  return (
    <PageShell title="Roger Hernández" kicker="Cibernético">
      <Panel>
        <p className="text-sm font-medium text-accent">Fundador de Skynet</p>
        <ul className="mt-4 space-y-2 text-sm">
          <li><a className="underline underline-offset-4 hover:text-accent" href="https://www.facebook.com/rogr.hernandez/" target="_blank" rel="noreferrer">Facebook @rogr.hernandez</a></li>
          <li><a className="underline underline-offset-4 hover:text-accent" href="https://www.instagram.com/rogerhernandzz/" target="_blank" rel="noreferrer">Instagram @rogerhernandzz</a></li>
          <li><a className="underline underline-offset-4 hover:text-accent" href="https://wa.me/584121062668" target="_blank" rel="noreferrer">WhatsApp +58 412 106 2668</a></li>
        </ul>
      </Panel>
    </PageShell>
  );
}
