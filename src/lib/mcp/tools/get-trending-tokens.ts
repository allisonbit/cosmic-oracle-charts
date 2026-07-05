import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_trending_tokens",
  title: "Get trending tokens",
  description:
    "Fetch the top trending cryptocurrencies right now (by search volume on CoinGecko).",
  inputSchema: {
    limit: z
      .number()
      .int()
      .min(1)
      .max(15)
      .optional()
      .describe("Max number of trending tokens to return (default 7)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ limit }) => {
    const res = await fetch("https://api.coingecko.com/api/v3/search/trending");
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `Failed to fetch trending (${res.status})` }],
        isError: true,
      };
    }
    const json = (await res.json()) as any;
    const coins = (json.coins ?? []).slice(0, limit ?? 7).map((c: any) => ({
      id: c.item?.id,
      name: c.item?.name,
      symbol: c.item?.symbol,
      market_cap_rank: c.item?.market_cap_rank,
      price_btc: c.item?.price_btc,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(coins) }],
      structuredContent: { trending: coins },
    };
  },
});