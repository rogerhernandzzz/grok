import { useEffect } from "react";
import { pingVisitor } from "@/lib/server/visitors";

const KEY = "skynet_vid";

function visitorId() {
  try {
    const current = window.localStorage.getItem(KEY);
    if (current && current.length >= 8) return current;
    const next = crypto.randomUUID();
    window.localStorage.setItem(KEY, next);
    return next;
  } catch {
    return `tmp-${Date.now()}`;
  }
}

export function VisitorBeacon() {
  useEffect(() => {
    const ping = () => {
      if (document.visibilityState === "hidden") return;
      void pingVisitor({
        data: { visitorId: visitorId(), path: window.location.pathname.slice(0, 120) || "/" },
      }).catch(() => undefined);
    };
    const wait = window.setTimeout(ping, 800);
    const id = window.setInterval(ping, 25000);
    document.addEventListener("visibilitychange", ping);
    return () => {
      window.clearTimeout(wait);
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", ping);
    };
  }, []);
  return null;
}
