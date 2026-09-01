import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { VisitorBeacon } from "@/components/visitor-beacon";
import appCss from "../styles.css?url";
import "../styles.css";

const APP_NAME = "SKYNET";

const fetchSessionUser = createServerFn({ method: "GET" }).handler(async () => {
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const u = await getSessionUser();
  return u ? { id: u.id, email: u.email } : null;
});

export const Route = createRootRoute({
  beforeLoad: async () => ({ sessionUser: await fetchSessionUser() }),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "description", content: "SKYNET — La Resistencia." },
    ],
    links: [
      { rel: "stylesheet", href: "/skynet.css?v=302" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700&display=optional",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="es">
      <head>
        <HeadContent />
        <style>{`html,body{margin:0;min-height:100%;background:#07070c;color:#f2f2f7}`}</style>
      </head>
      <body>
        <AuthProvider>
          <PreviewHostBridge />
          <VisitorBeacon />
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
