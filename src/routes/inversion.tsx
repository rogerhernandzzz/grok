import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { getTraderState, simulateTrade } from "@/lib/server/trader";
import { Button } from "@/components/ui/button";
import { PageShell, Panel } from "@/components/page-shell";

export const Route = createFileRoute("/inversion")({ component: Inversion });

function Inversion() {
  const { user, isPending } = useCurrentUserState();
  const [state, setState] = useState<Awaited<ReturnType<typeof getTraderState>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!user) return;
    void getTraderState().then(setState).catch(() => undefined);
  }, [user]);
  if (isPending) return <PageShell title="Inversión" kicker="Simulador"><div className="h-40 animate-pulse rounded-xl bg-surface" /></PageShell>;
  if (!user) return <RedirectToSignIn />;
  return (
    <PageShell title="Inversión" kicker="Simulador">
      <Panel className="space-y-4">
        <p className="text-sm text-muted">Saldo ficticio. Cero dinero real. LUZ no se compra aquí.</p>
        <p className="font-mono text-2xl">${(state?.balance ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
        {error ? <p className="text-sm text-accent">{error}</p> : null}
        <div className="flex flex-wrap gap-2">
          {(["BTC", "ETH", "SOL"] as const).map((symbol) => (
            <Button
              key={symbol}
              variant="outline"
              onClick={() => {
                setError(null);
                void simulateTrade({ data: { symbol, side: "buy" } })
                  .then(setState)
                  .catch((err) => setError(err instanceof Error ? err.message : "Error"));
              }}
            >
              Comprar {symbol} (sim)
            </Button>
          ))}
        </div>
      </Panel>
    </PageShell>
  );
}
