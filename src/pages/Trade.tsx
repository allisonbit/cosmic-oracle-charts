import { useState, useEffect, useCallback } from "react";
import { useAccount, useSendTransaction, useSwitchChain } from "wagmi";
import { parseEther, formatEther, formatUnits } from "viem";
import { Layout } from "@/components/layout/Layout";
import { useTrading } from "@/hooks/useTrading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowDownUp, ArrowRight, Wallet, AlertTriangle, CheckCircle2, RefreshCw, Zap, Globe } from "lucide-react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const POPULAR_TOKENS: Record<number, { address: string; symbol: string; decimals: number; logo?: string }[]> = {
  1: [
    { address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", symbol: "ETH", decimals: 18 },
    { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", decimals: 6 },
    { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", decimals: 6 },
    { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI", decimals: 18 },
    { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", symbol: "WBTC", decimals: 8 },
    { address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", symbol: "LINK", decimals: 18 },
  ],
  8453: [
    { address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", symbol: "ETH", decimals: 18 },
    { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", symbol: "USDC", decimals: 6 },
    { address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", symbol: "DAI", decimals: 18 },
  ],
  137: [
    { address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", symbol: "MATIC", decimals: 18 },
    { address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", symbol: "USDC", decimals: 6 },
    { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", symbol: "USDT", decimals: 6 },
  ],
  42161: [
    { address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", symbol: "ETH", decimals: 18 },
    { address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", symbol: "USDC", decimals: 6 },
    { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", symbol: "USDT", decimals: 6 },
  ],
  10: [
    { address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", symbol: "ETH", decimals: 18 },
    { address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", symbol: "USDC", decimals: 6 },
  ],
  56: [
    { address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", symbol: "BNB", decimals: 18 },
    { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", symbol: "USDC", decimals: 18 },
    { address: "0x55d398326f99059fF775485246999027B3197955", symbol: "USDT", decimals: 18 },
  ],
  43114: [
    { address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", symbol: "AVAX", decimals: 18 },
    { address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", symbol: "USDC", decimals: 6 },
  ],
};

function SwapPanel() {
  const { address, isConnected, chainId: walletChainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { sendTransaction, isPending: isSending } = useSendTransaction();
  const { loading, error, getSwapQuote, getSwapPrice, supportedChains } = useTrading();

  const [chainId, setChainId] = useState(1);
  const [sellToken, setSellToken] = useState("");
  const [buyToken, setBuyToken] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [quote, setQuote] = useState<any>(null);
  const [priceInfo, setPriceInfo] = useState<any>(null);

  const tokens = POPULAR_TOKENS[chainId] || POPULAR_TOKENS[1];

  useEffect(() => {
    if (tokens.length >= 2) {
      setSellToken(tokens[0].address);
      setBuyToken(tokens[1].address);
    }
    setQuote(null);
    setPriceInfo(null);
  }, [chainId]);

  const sellTokenInfo = tokens.find(t => t.address === sellToken);
  const buyTokenInfo = tokens.find(t => t.address === buyToken);

  const handleGetPrice = useCallback(async () => {
    if (!sellToken || !buyToken || !sellAmount || Number(sellAmount) <= 0) return;
    const decimals = sellTokenInfo?.decimals || 18;
    const rawAmount = BigInt(Math.floor(Number(sellAmount) * 10 ** decimals)).toString();
    const result = await getSwapPrice(chainId, sellToken, buyToken, rawAmount);
    if (result) setPriceInfo(result);
  }, [chainId, sellToken, buyToken, sellAmount, sellTokenInfo, getSwapPrice]);

  const handleGetQuote = useCallback(async () => {
    if (!sellToken || !buyToken || !sellAmount || !address) return;
    const decimals = sellTokenInfo?.decimals || 18;
    const rawAmount = BigInt(Math.floor(Number(sellAmount) * 10 ** decimals)).toString();
    const result = await getSwapQuote(chainId, sellToken, buyToken, rawAmount, address);
    if (result) setQuote(result);
  }, [chainId, sellToken, buyToken, sellAmount, address, sellTokenInfo, getSwapQuote]);

  const handleSwap = useCallback(async () => {
    if (!quote || !address) return;

    // Switch chain if needed
    if (walletChainId !== chainId) {
      try {
        switchChain({ chainId });
        toast.info("Please switch network in your wallet");
        return;
      } catch {
        toast.error("Failed to switch network");
        return;
      }
    }

    try {
      sendTransaction({
        to: quote.to as `0x${string}`,
        data: quote.data as `0x${string}`,
        value: BigInt(quote.value || "0"),
      });
      toast.success("Transaction submitted! Check your wallet for confirmation.");
    } catch (e: any) {
      toast.error(e.message || "Swap failed");
    }
  }, [quote, address, walletChainId, chainId, switchChain, sendTransaction]);

  const handleFlipTokens = () => {
    setSellToken(buyToken);
    setBuyToken(sellToken);
    setQuote(null);
    setPriceInfo(null);
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ArrowDownUp className="w-5 h-5 text-primary" />
          Swap Tokens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chain selector */}
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Network</label>
          <Select value={String(chainId)} onValueChange={v => setChainId(Number(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {supportedChains.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.icon} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sell token */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">You pay</label>
          <div className="flex gap-2">
            <Select value={sellToken} onValueChange={v => { setSellToken(v); setQuote(null); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Token" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map(t => (
                  <SelectItem key={t.address} value={t.address} disabled={t.address === buyToken}>
                    {t.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.0"
              value={sellAmount}
              onChange={e => { setSellAmount(e.target.value); setQuote(null); setPriceInfo(null); }}
              className="flex-1"
            />
          </div>
        </div>

        {/* Flip button */}
        <div className="flex justify-center">
          <Button variant="ghost" size="icon" onClick={handleFlipTokens} className="rounded-full border border-border">
            <ArrowDownUp className="w-4 h-4" />
          </Button>
        </div>

        {/* Buy token */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">You receive</label>
          <div className="flex gap-2">
            <Select value={buyToken} onValueChange={v => { setBuyToken(v); setQuote(null); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Token" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map(t => (
                  <SelectItem key={t.address} value={t.address} disabled={t.address === sellToken}>
                    {t.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              readOnly
              placeholder="0.0"
              value={
                quote
                  ? formatUnits(BigInt(quote.buyAmount || "0"), buyTokenInfo?.decimals || 18)
                  : priceInfo?.buyAmount
                    ? formatUnits(BigInt(priceInfo.buyAmount), buyTokenInfo?.decimals || 18)
                    : ""
              }
              className="flex-1 bg-muted/30"
            />
          </div>
        </div>

        {/* Price info */}
        {priceInfo && (
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 space-y-1">
            <div className="flex justify-between">
              <span>Estimated Price</span>
              <span>1 {sellTokenInfo?.symbol} ≈ {Number(priceInfo.price || 0).toFixed(6)} {buyTokenInfo?.symbol}</span>
            </div>
            {priceInfo.estimatedGas && (
              <div className="flex justify-between">
                <span>Est. Gas</span>
                <span>{Number(priceInfo.estimatedGas).toLocaleString()}</span>
              </div>
            )}
            {priceInfo.sources?.length > 0 && (
              <div className="flex justify-between">
                <span>Sources</span>
                <span>{priceInfo.sources.filter((s: any) => s.proportion !== "0").map((s: any) => s.name).join(", ") || "Best route"}</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {!quote ? (
            <div className="flex gap-2">
              <Button
                onClick={handleGetPrice}
                disabled={loading || !sellToken || !buyToken || !sellAmount}
                className="flex-1"
                variant="outline"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Get Price
              </Button>
              <Button
                onClick={handleGetQuote}
                disabled={loading || !sellToken || !buyToken || !sellAmount || !isConnected}
                className="flex-1"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                Get Quote
              </Button>
            </div>
          ) : (
            <Button onClick={handleSwap} disabled={isSending} className="w-full" size="lg">
              {isSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              {walletChainId !== chainId ? "Switch Network & Swap" : "Confirm Swap"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function BridgePanel() {
  const { address } = useAccount();
  const { sendTransaction, isPending: isSending } = useSendTransaction();
  const { loading, error, getBridgeQuote, supportedChains } = useTrading();

  const [fromChainId, setFromChainId] = useState(1);
  const [toChainId, setToChainId] = useState(8453);
  const [fromToken, setFromToken] = useState("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE");
  const [toToken, setToToken] = useState("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE");
  const [amount, setAmount] = useState("");
  const [bridgeQuote, setBridgeQuote] = useState<any>(null);

  const fromTokens = POPULAR_TOKENS[fromChainId] || POPULAR_TOKENS[1];
  const toTokens = POPULAR_TOKENS[toChainId] || POPULAR_TOKENS[1];

  useEffect(() => {
    setFromToken(fromTokens[0]?.address || "");
    setBridgeQuote(null);
  }, [fromChainId]);

  useEffect(() => {
    setToToken(toTokens[0]?.address || "");
    setBridgeQuote(null);
  }, [toChainId]);

  const fromTokenInfo = fromTokens.find(t => t.address === fromToken);

  const handleQuote = async () => {
    if (!amount || Number(amount) <= 0) return;
    const decimals = fromTokenInfo?.decimals || 18;
    const rawAmount = BigInt(Math.floor(Number(amount) * 10 ** decimals)).toString();
    const result = await getBridgeQuote(fromChainId, toChainId, fromToken, toToken, rawAmount, address);
    if (result) setBridgeQuote(result);
  };

  const handleBridge = async () => {
    if (!bridgeQuote?.transactionRequest) {
      toast.error("No transaction data available");
      return;
    }
    try {
      const tx = bridgeQuote.transactionRequest;
      sendTransaction({
        to: tx.to as `0x${string}`,
        data: tx.data as `0x${string}`,
        value: BigInt(tx.value || "0"),
      });
      toast.success("Bridge transaction submitted!");
    } catch (e: any) {
      toast.error(e.message || "Bridge failed");
    }
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Bridge Tokens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From chain */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">From</label>
          <div className="flex gap-2">
            <Select value={String(fromChainId)} onValueChange={v => setFromChainId(Number(v))}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedChains.map(c => (
                  <SelectItem key={c.id} value={String(c.id)} disabled={c.id === toChainId}>{c.icon} {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={fromToken} onValueChange={v => { setFromToken(v); setBridgeQuote(null); }}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fromTokens.map(t => (
                  <SelectItem key={t.address} value={t.address}>{t.symbol}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" placeholder="0.0" value={amount} onChange={e => { setAmount(e.target.value); setBridgeQuote(null); }} className="flex-1" />
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* To chain */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">To</label>
          <div className="flex gap-2">
            <Select value={String(toChainId)} onValueChange={v => setToChainId(Number(v))}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedChains.map(c => (
                  <SelectItem key={c.id} value={String(c.id)} disabled={c.id === fromChainId}>{c.icon} {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={toToken} onValueChange={v => { setToToken(v); setBridgeQuote(null); }}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {toTokens.map(t => (
                  <SelectItem key={t.address} value={t.address}>{t.symbol}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              readOnly
              placeholder="0.0"
              value={bridgeQuote?.estimate?.toAmount ? formatUnits(BigInt(bridgeQuote.estimate.toAmount), toTokens.find(t => t.address === toToken)?.decimals || 18) : ""}
              className="flex-1 bg-muted/30"
            />
          </div>
        </div>

        {/* Bridge estimate */}
        {bridgeQuote && (
          <div className="text-xs bg-muted/30 rounded-lg p-3 space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span>Bridge Provider</span>
              <Badge variant="secondary" className="text-xs">{bridgeQuote.tool || "Best Route"}</Badge>
            </div>
            {bridgeQuote.estimate?.executionDuration && (
              <div className="flex justify-between text-muted-foreground">
                <span>Est. Time</span>
                <span>{Math.ceil(bridgeQuote.estimate.executionDuration / 60)} min</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!bridgeQuote ? (
          <Button onClick={handleQuote} disabled={loading || !amount || fromChainId === toChainId} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Get Bridge Quote
          </Button>
        ) : (
          <Button onClick={handleBridge} disabled={isSending} className="w-full" size="lg">
            {isSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            Confirm Bridge
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function TradingContent() {
  const { isConnected } = useAccount();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Trade</h1>
          <p className="text-muted-foreground mt-1">Swap tokens on any chain or bridge across networks</p>
        </div>

        <Tabs defaultValue="swap" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="swap" className="gap-2">
              <ArrowDownUp className="w-4 h-4" /> Swap
            </TabsTrigger>
            <TabsTrigger value="bridge" className="gap-2">
              <Globe className="w-4 h-4" /> Bridge
            </TabsTrigger>
          </TabsList>

          <TabsContent value="swap">
            <SwapPanel />
          </TabsContent>

          <TabsContent value="bridge">
            <BridgePanel />
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>Powered by decentralized liquidity aggregation · No fees from Oracle Bull</p>
          <p className="mt-1">Always review transactions in your wallet before confirming</p>
        </div>
      </div>
    </Layout>
  );
}

export default function Trade() {
  return (
    <ProtectedRoute>
      <TradingContent />
    </ProtectedRoute>
  );
}
