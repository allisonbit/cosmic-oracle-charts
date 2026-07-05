import { defineMcp } from "@lovable.dev/mcp-js";
import getTokenPriceTool from "./tools/get-token-price";
import getTrendingTokensTool from "./tools/get-trending-tokens";
import searchTokensTool from "./tools/search-tokens";

export default defineMcp({
  name: "oracle-bull-mcp",
  title: "Oracle Bull MCP",
  version: "0.1.0",
  instructions:
    "Read-only crypto market tools from Oracle Bull. Use `search_tokens` to resolve a symbol to a CoinGecko id, `get_token_price` for live price/market data, and `get_trending_tokens` for what is trending right now.",
  tools: [searchTokensTool, getTokenPriceTool, getTrendingTokensTool],
});