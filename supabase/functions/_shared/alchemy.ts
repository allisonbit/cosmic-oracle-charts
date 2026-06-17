// Shared Alchemy helper — single source of truth for key selection.
//
// Why this exists:
//   Previously, whale-tracker / chain-health / chain-data each re-implemented
//   key selection. Two of them used a module-level `let keyIndex = 0` round-robin
//   counter that resets to 0 on every cold start, so under bursty traffic every
//   new isolate always hits ALCHEMY_API_KEY_1 first — defeating load balancing.
//
// This module:
//   - Reads all configured ALCHEMY_API_KEY_{1..N} once
//   - Picks a key per call using Math.random(), which is stateless and gives
//     true uniform distribution across isolates without shared state.

let cachedKeys: string[] | null = null;

export function getAlchemyKeys(): string[] {
  if (cachedKeys) return cachedKeys;
  const keys: string[] = [];
  for (let i = 1; i <= 10; i++) {
    const k = Deno.env.get(`ALCHEMY_API_KEY_${i}`);
    if (k) keys.push(k);
  }
  // Also accept the legacy unsuffixed name as a fallback.
  const legacy = Deno.env.get("ALCHEMY_API_KEY");
  if (legacy && !keys.includes(legacy)) keys.push(legacy);
  cachedKeys = keys;
  return keys;
}

/** Stateless random key selection — uniform across isolates and concurrent requests. */
export function getAlchemyKey(): string {
  const keys = getAlchemyKeys();
  if (keys.length === 0) throw new Error("No Alchemy API keys configured");
  return keys[Math.floor(Math.random() * keys.length)];
}

/** Same as getAlchemyKey but returns "" instead of throwing — for fns that fall back gracefully. */
export function getAlchemyKeyOrEmpty(): string {
  const keys = getAlchemyKeys();
  if (keys.length === 0) return "";
  return keys[Math.floor(Math.random() * keys.length)];
}

export const ALCHEMY_NETWORKS: Record<string, string> = {
  ethereum: "eth-mainnet",
  polygon: "polygon-mainnet",
  arbitrum: "arb-mainnet",
  optimism: "opt-mainnet",
  base: "base-mainnet",
  solana: "solana-mainnet",
};