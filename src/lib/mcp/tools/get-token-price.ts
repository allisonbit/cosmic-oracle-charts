import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_token_price",
  title: "Get token price",
  description:
    "Fetch the current USD price, 24h change, market cap, and volume for a cryptocurrency by CoinGecko id (e.g. 'bitcoin', 'ethereum', 'ethena').",
  inputSchema: {
    coin_id: z
      .string()
      .min(1)
      .describe("CoinGecko coin id, lowercase (e.g. 'bitcoin', 'ethereum')."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ coin_id }) => {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
      coin_id,
    )}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`;
    const res = await fetch(url);
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `Failed to fetch price (${res.status})` }],
        isError: true,
      };
    }
    const json = (await res.json()) as Record<string, any>;
    const data = json[coin_id];
    if (!data) {
      return {
        content: [{ type: "text", text: `Unknown coin id: ${coin_id}` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: {
        coin_id,
        price_usd: data.usd,
        market_cap_usd: data.usd_market_cap,
        volume_24h_usd: data.usd_24h_vol,
        change_24h_pct: data.usd_24h_change,
      },
    };
  },
});