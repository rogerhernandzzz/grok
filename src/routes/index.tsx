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
    <div className="relative min-h-svh bg-bg text-fg">
      <div className="home-glow" />
      <header className="absolute inset-x-0 top-0 z-30 flex items-start justify-between px-4 py-5 sm:px-6">
        <div className="font-mono text-xs tracking-widest text-muted">
          SKYNET <span className="text-accent">v2</span>
        </div>
        <AuthBar />
      </header>
      <div className="relative z-0 flex min-h-svh flex-col items-center justify-center px-3 pt-20 pb-10">
        <RadialMenu />
      </div>
      <footer className="live-roster">
        <div className="text-accent tabular-nums">
          Recaudado verificado: ${stats.raised.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </div>
      </footer>
    </div>
  );
}
