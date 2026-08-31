import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { signOut } from "@/lib/auth/client";
import { getAdminStatus, ensureMyProfile } from "@/lib/server/profiles";
import { PresenceBeacon } from "@/components/presence-beacon";
import { NoticeBell } from "@/components/notice-bell";
import { Button } from "@/components/ui/button";

export function AuthBar() {
  const { user, isPending } = useCurrentUserState();
  const [isAdmin, setIsAdmin] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    void ensureMyProfile()
      .then(() => getAdminStatus())
      .then((status) => {
        if (!cancelled) setIsAdmin(status.isAdmin);
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (isPending) {
    return <div className="h-9 w-36 animate-pulse rounded-sm bg-elevated" />;
  }

  if (!user) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Link
          to="/registro"
          className="inline-flex h-9 items-center rounded-sm border border-border px-3 font-mono text-[11px] tracking-widest uppercase text-fg hover:border-accent hover:text-accent"
        >
          Registro
        </Link>
        <Link
          to="/login"
          className="inline-flex h-9 items-center rounded-sm bg-fg px-3 font-mono text-[11px] tracking-widest uppercase text-bg hover:bg-accent hover:text-accent-fg"
        >
          Ingresar
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <PresenceBeacon />
      <NoticeBell />
      <Link
        to="/panel"
        className="inline-flex h-9 items-center rounded-sm border border-border px-3 font-mono text-[11px] tracking-widest uppercase text-fg hover:border-accent hover:text-accent"
      >
        Panel
      </Link>
      {isAdmin ? (
        <Link
          to="/admin"
          className="inline-flex h-9 items-center rounded-sm border border-accent/40 px-3 font-mono text-[11px] tracking-widest uppercase text-accent hover:bg-accent hover:text-accent-fg"
        >
          Admin
        </Link>
      ) : null}
      <Button
        variant="ghost"
        size="sm"
        disabled={signingOut}
        onClick={() => {
          setSigningOut(true);
          void signOut().catch(() => setSigningOut(false));
        }}
      >
        {signingOut ? "Saliendo" : "Salir"}
      </Button>
    </div>
  );
}
