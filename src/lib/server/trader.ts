import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";

const PRICES: Record<string, number> = { BTC: 64000, ETH: 3200, SOL: 140, LUZ: 0 };

export const getTraderState = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ balance: string; holdings: string }>`
      select balance::text as balance, holdings::text as holdings from trader_state where user_id = ${context.userId}
    `;
    if (!rows[0]) {
      await sql`insert into trader_state (user_id) values (${context.userId})`;
      return { balance: 10000, holdings: {} as Record<string, number>, prices: PRICES };
    }
    return { balance: Number(rows[0].balance), holdings: JSON.parse(rows[0].holdings || "{}") as Record<string, number>, prices: PRICES };
  });

export const simulateTrade = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ symbol: z.enum(["BTC", "ETH", "SOL", "LUZ"]), side: z.enum(["buy", "sell"]) }))
  .handler(async ({ context, data }) => {
    if (data.symbol === "LUZ") throw new Error("LUZ no cotiza. Es un diseño, no un mercado.");
    const sql = await getSql();
    const rows = await sql<{ balance: string; holdings: string }>`
      select balance::text as balance, holdings::text as holdings from trader_state where user_id = ${context.userId}
    `;
    if (!rows[0]) {
      await sql`insert into trader_state (user_id) values (${context.userId})`;
    }
    const balance0 = rows[0] ? Number(rows[0].balance) : 10000;
    const holdings = (rows[0] ? JSON.parse(rows[0].holdings || "{}") : {}) as Record<string, number>;
    const price = PRICES[data.symbol] ?? 0;
    const qty = 0.01;
    const cost = price * qty;
    let balance = balance0;
    if (data.side === "buy") {
      if (balance < cost) throw new Error("Saldo insuficiente (simulador)");
      balance -= cost;
      holdings[data.symbol] = (holdings[data.symbol] ?? 0) + qty;
    } else {
      if ((holdings[data.symbol] ?? 0) < qty) throw new Error("No tienes esa posición");
      holdings[data.symbol] -= qty;
      balance += cost;
    }
    await sql`update trader_state set balance = ${balance}, holdings = ${JSON.stringify(holdings)}::jsonb, updated_at = now() where user_id = ${context.userId}`;
    return { balance, holdings, prices: PRICES };
  });
