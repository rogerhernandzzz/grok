import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, authClient, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell, Panel } from "@/components/page-shell";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error: err } = await authClient.signIn.email({ email, password });
      if (err) {
        setError(err.message ?? "No se pudo ingresar");
        return;
      }
      await navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo ingresar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell title="Ingresar" kicker="Acceso">
      <Panel className="mx-auto max-w-md space-y-5">
        {!authEnabled ? (
          <p className="text-sm text-muted">El acceso está desactivado.</p>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    setBusy(true);
                    void signIn(p.providerId).catch((err) => {
                      setError(err instanceof Error ? err.message : "No se pudo ingresar");
                      setBusy(false);
                    });
                  }}
                >
                  Continuar con {p.label}
                </Button>
              ))}
            </div>
            <form className="space-y-3" method="post" onSubmit={(e) => void onSubmit(e)}>
              <Input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
              {error ? <p className="text-sm text-accent">{error}</p> : null}
              <Button type="submit" disabled={busy}>
                {busy ? "…" : "Entrar"}
              </Button>
            </form>
          </>
        )}
        <p className="text-sm text-muted">
          ¿Sin cuenta?{" "}
          <Link to="/registro" className="underline underline-offset-4 hover:text-accent">
            Registro
          </Link>
        </p>
      </Panel>
    </PageShell>
  );
}
