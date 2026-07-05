import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "search_tokens",
  title: "Search cryptocurrencies",
  description:
    "Search for cryptocurrencies by name or symbol. Returns matching coins with their CoinGecko id, useful for feeding into get_token_price.",
  inputSchema: {
    query: z.string().min(1).describe("Search query, e.g. 'sol' or 'ethena'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ query }) => {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
    );
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `Search failed (${res.status})` }],
        isError: true,
      };
    }
    const json = (await res.json()) as any;
    const coins = (json.coins ?? []).slice(0, 10).map((c: any) => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol,
      market_cap_rank: c.market_cap_rank,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(coins) }],
      structuredContent: { results: coins },
    };
  },
});