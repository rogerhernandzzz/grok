import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { authEnabled, authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell, Panel } from "@/components/page-shell";

export const Route = createFileRoute("/registro")({ component: Registro });

function Registro() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error: err } = await authClient.signUp.email({ email, password, name });
      if (err) {
        setError(err.message ?? "No se pudo registrar");
        return;
      }
      await navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell title="Registro" kicker="Alta">
      <Panel className="mx-auto max-w-md space-y-5">
        {!authEnabled ? (
          <p className="text-sm text-muted">El registro está desactivado.</p>
        ) : (
          <form className="space-y-3" method="post" onSubmit={(e) => void onSubmit(e)}>
            <Input placeholder="Alias" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            {error ? <p className="text-sm text-accent">{error}</p> : null}
            <Button type="submit" disabled={busy}>
              {busy ? "…" : "Crear cuenta"}
            </Button>
          </form>
        )}
        <p className="text-sm text-muted">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="underline underline-offset-4 hover:text-accent">
            Ingresar
          </Link>
        </p>
      </Panel>
    </PageShell>
  );
}
