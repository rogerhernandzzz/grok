import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AuthBar } from "@/components/auth-bar";

export function PageShell({
  title,
  kicker,
  children,
  wide = false,
}: {
  title: string;
  kicker?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="relative z-30 flex flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-6">
        <Link to="/" className="font-mono text-[11px] tracking-[0.28em] text-muted hover:text-fg">
          SKYNET
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <AuthBar />
          <Link
            to="/"
            className="inline-flex h-9 items-center rounded-sm border border-border px-3 font-mono text-[11px] tracking-widest uppercase text-fg hover:border-accent hover:text-accent"
          >
            Volver
          </Link>
        </div>
      </header>
      <main className={`mx-auto w-full px-4 pb-16 pt-6 sm:px-6 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
        {kicker ? (
          <p className="mb-2 font-mono text-[11px] tracking-[0.28em] text-accent uppercase">{kicker}</p>
        ) : null}
        <h1 className="mb-8 font-sans text-3xl font-semibold tracking-tight text-fg sm:text-4xl">{title}</h1>
        {children}
      </main>
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-border bg-surface p-5 sm:p-6 ${className}`}>{children}</section>
  );
}
