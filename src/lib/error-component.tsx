import type { ErrorComponentProps } from "@tanstack/react-router";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-fg">
      <p className="max-w-md text-sm leading-relaxed text-muted">
        {error.message || "Error inesperado."}
      </p>
      <a
        href="/"
        className="inline-flex h-9 items-center rounded-sm bg-fg px-3 font-mono text-[11px] tracking-widest uppercase text-bg"
      >
        Volver
      </a>
    </main>
  );
}
