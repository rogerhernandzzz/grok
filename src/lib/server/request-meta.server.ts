import { getRequest } from "@tanstack/react-start/server";

export function clientIpFromRequest() {
  try {
    const req = getRequest();
    const forwarded = req.headers.get("x-forwarded-for") || "";
    const real = req.headers.get("x-real-ip") || "";
    const cf = req.headers.get("cf-connecting-ip") || "";
    const raw = (cf || real || forwarded.split(",")[0] || "").trim();
    return raw || "unknown";
  } catch {
    return "unknown";
  }
}
