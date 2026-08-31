import { useEffect } from "react";
import { touchPresence } from "@/lib/server/profiles";

export function PresenceBeacon() {
  useEffect(() => {
    const beat = () => {
      if (document.visibilityState === "hidden") return;
      void touchPresence().catch(() => undefined);
    };
    const wait = window.setTimeout(beat, 400);
    const id = window.setInterval(beat, 20000);
    document.addEventListener("visibilitychange", beat);
    return () => {
      window.clearTimeout(wait);
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", beat);
    };
  }, []);
  return null;
}
