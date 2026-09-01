import { createFileRoute } from "@tanstack/react-router";
import { AuthBar } from "@/components/auth-bar";
import { RadialMenu } from "@/components/radial-menu";
import { getPublicStats } from "@/lib/server/content";

export const Route = createFileRoute("/")({
  loader: () => getPublicStats(),
  component: Home,
  staleTime: 10_000,
});

function Home() {
  const stats = Route.useLoaderData();
  return (
    <div className="home-frame">
      <div className="home-glow" />
      <header className="home-bar">
        <div className="font-mono text-xs tracking-widest text-muted">
          SKYNET <span className="text-accent">v2</span>
        </div>
        <AuthBar />
      </header>
      <RadialMenu />
      <footer className="live-roster">
        <div className="text-accent tabular-nums">
          Recaudado verificado: ${stats.raised.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </div>
      </footer>
    </div>
  );
}
