import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useState } from "react";
import { Wallet, ExternalLink, ShieldCheck, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/MainSEO";

// Standalone build: multi-chain wallet analysis needs an on-chain indexer
// backend, which this build doesn't include. Instead of a dead API call we
// validate the address and hand off to public block explorers — real,
// honest utility with no fabricated data.
const EXPLORERS = [
  { label: "Etherscan", url: (a: string) => `https://etherscan.io/address/${a}`, test: (a: string) => /^0x[a-fA-F0-9]{40}$/.test(a), chains: "Ethereum" },
  { label: "Basescan", url: (a: string) => `https://basescan.org/address/${a}`, test: (a: string) => /^0x[a-fA-F0-9]{40}$/.test(a), chains: "Base" },
  { label: "Arbiscan", url: (a: string) => `https://arbiscan.io/address/${a}`, test: (a: string) => /^0x[a-fA-F0-9]{40}$/.test(a), chains: "Arbitrum" },
  { label: "Polygonscan", url: (a: string) => `https://polygonscan.com/address/${a}`, test: (a: string) => /^0x[a-fA-F0-9]{40}$/.test(a), chains: "Polygon" },
  { label: "Solscan", url: (a: string) => `https://solscan.io/account/${a}`, test: (a: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a), chains: "Solana" },
];

function ScannerContent() {
  const [address, setAddress] = useState("");
  const trimmed = address.trim();
  const matching = trimmed ? EXPLORERS.filter((e) => e.test(trimmed)) : [];
  const looksLikeAddress = trimmed.length >= 20 && matching.length > 0;

  return (
    <Layout>
      <SEO
        title="Wallet Scanner – Open Any Wallet in Public Block Explorers"
        description="Paste an EVM or Solana wallet address to open it in Etherscan, Basescan, Arbiscan, Polygonscan, or Solscan."
      />
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/20">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Wallet Scanner</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Open any wallet in public block explorers</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x… or Solana address"
                className="font-mono text-sm"
                aria-label="Wallet address"
              />
            </div>

            {trimmed && !looksLikeAddress && (
              <p className="text-xs text-warning flex items-start gap-2">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                That doesn't look like a valid EVM (0x + 40 hex) or Solana address yet.
              </p>
            )}

            {looksLikeAddress && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {matching.map((e) => (
                  <Button key={e.label} variant="outline" size="sm" asChild>
                    <a href={e.url(trimmed)} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" />
                      {e.label}
                      <span className="text-[10px] text-muted-foreground hidden sm:inline">· {e.chains}</span>
                    </a>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              In-depth wallet analysis (holdings, P&amp;L, risk scoring) requires an on-chain indexer backend
              that isn't part of this standalone build. The explorer links above are the honest alternative —
              they show the full on-chain record directly at the source. Nothing you paste here leaves your browser.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default function MyWalletScanner() {
  return (
    <ProtectedRoute>
      <ScannerContent />
    </ProtectedRoute>
  );
}
