import { useState, useEffect, useCallback } from "react";
import { useAccount, useSendTransaction, useSwitchChain } from "wagmi";
import { formatUnits } from "viem";
import { Layout } from "@/components/layout/Layout";
import { useTrading } from "@/hooks/useTrading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowDownUp, ArrowRight, Wallet, AlertTriangle, CheckCircle2, RefreshCw, Zap, Globe, Plus } from "lucide-react";
import { toast } from "sonner";
import { POPULAR_TOKENS, type TokenInfo } from "@/lib/tradingTokens";

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
  const [customSellAddress, setCustomSellAddress] = useState("");
  const [customBuyAddress, setCustomBuyAddress] = useState("");
  const [showCustomSell, setShowCustomSell] = useState(false);
  const [showCustomBuy, setShowCustomBuy] = useState(false);

  const tokens = POPULAR_TOKENS[chainId] || POPULAR_TOKENS[1];

  useEffect(() => {
    if (tokens.length >= 2) {
      setSellToken(tokens[0].address);
      setBuyToken(tokens[1].address);
    }
    setQuote(null);
    setPriceInfo(null);
    setShowCustomSell(false);
    setShowCustomBuy(false);
  }, [chainId]);

  const activeSellToken = showCustomSell && customSellAddress.startsWith("0x") ? customSellAddress : sellToken;
  const activeBuyToken = showCustomBuy && customBuyAddress.startsWith("0x") ? customBuyAddress : buyToken;
  const sellTokenInfo = tokens.find(t => t.address.toLowerCase() === activeSellToken.toLowerCase());
  const buyTokenInfo = tokens.find(t => t.address.toLowerCase() === activeBuyToken.toLowerCase());

  const handleGetPrice = useCallback(async () => {
    if (!activeSellToken || !activeBuyToken || !sellAmount || Number(sellAmount) <= 0) return;
    const decimals = sellTokenInfo?.decimals || 18;
    const rawAmount = BigInt(Math.floor(Number(sellAmount) * 10 ** decimals)).toString();
    const result = await getSwapPrice(chainId, activeSellToken, activeBuyToken, rawAmount);
    if (result) setPriceInfo(result);
  }, [chainId, activeSellToken, activeBuyToken, sellAmount, sellTokenInfo, getSwapPrice]);

  const handleGetQuote = useCallback(async () => {
    if (!activeSellToken || !activeBuyToken || !sellAmount || !address) return;
    const decimals = sellTokenInfo?.decimals || 18;
    const rawAmount = BigInt(Math.floor(Number(sellAmount) * 10 ** decimals)).toString();
    const result = await getSwapQuote(chainId, activeSellToken, activeBuyToken, rawAmount, address);
    if (result) setQuote(result);
  }, [chainId, activeSellToken, activeBuyToken, sellAmount, address, sellTokenInfo, getSwapQuote]);

  const handleSwap = useCallback(async () => {
    if (!quote || !address) return;
    if (walletChainId !== chainId) {
      try { switchChain({ chainId }); toast.info("Switch network in your wallet"); return; } catch { toast.error("Failed to switch network"); return; }
    }
    try {
      sendTransaction({ to: quote.to as `0x${string}`, data: quote.data as `0x${string}`, value: BigInt(quote.value || "0") });
      toast.success("Transaction submitted!");
    } catch (e: any) { toast.error(e.message || "Swap failed"); }
  }, [quote, address, walletChainId, chainId, switchChain, sendTransaction]);

  const handleFlipTokens = () => {
    const tempSell = activeSellToken;
    const tempBuy = activeBuyToken;
    if (showCustomSell || showCustomBuy) {
      setCustomSellAddress(tempBuy);
      setCustomBuyAddress(tempSell);
      setShowCustomSell(true);
      setShowCustomBuy(true);
    } else {
      setSellToken(tempBuy);
      setBuyToken(tempSell);
    }
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
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Network</label>
          <Select value={String(chainId)} onValueChange={v => setChainId(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {supportedChains.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.icon} {c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground">You pay</label>
            <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setShowCustomSell(!showCustomSell)}>
              <Plus className="w-3 h-3 mr-1" /> {showCustomSell ? "List" : "Custom"}
            </Button>
          </div>
          <div className="flex gap-2">
            {showCustomSell ? (
              <Input placeholder="Paste token address (0x...)" value={customSellAddress} onChange={e => { setCustomSellAddress(e.target.value); setQuote(null); }} className="w-[180px] text-xs" />
            ) : (
              <Select value={sellToken} onValueChange={v => { setSellToken(v); setQuote(null); }}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Token" /></SelectTrigger>
                <SelectContent>{tokens.map(t => <SelectItem key={t.address} value={t.address} disabled={t.address === buyToken}>{t.symbol}</SelectItem>)}</SelectContent>
              </Select>
            )}
            <Input type="number" placeholder="0.0" value={sellAmount} onChange={e => { setSellAmount(e.target.value); setQuote(null); setPriceInfo(null); }} className="flex-1" />
          </div>
        </div>

        <div className="flex justify-center">
          <Button variant="ghost" size="icon" onClick={handleFlipTokens} className="rounded-full border border-border">
            <ArrowDownUp className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground">You receive</label>
            <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setShowCustomBuy(!showCustomBuy)}>
              <Plus className="w-3 h-3 mr-1" /> {showCustomBuy ? "List" : "Custom"}
            </Button>
          </div>
          <div className="flex gap-2">
            {showCustomBuy ? (
              <Input placeholder="Paste token address (0x...)" value={customBuyAddress} onChange={e => { setCustomBuyAddress(e.target.value); setQuote(null); }} className="w-[180px] text-xs" />
            ) : (
              <Select value={buyToken} onValueChange={v => { setBuyToken(v); setQuote(null); }}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Token" /></SelectTrigger>
                <SelectContent>{tokens.map(t => <SelectItem key={t.address} value={t.address} disabled={t.address === sellToken}>{t.symbol}</SelectItem>)}</SelectContent>
              </Select>
            )}
            <Input readOnly placeholder="0.0" value={quote ? formatUnits(BigInt(quote.buyAmount || "0"), buyTokenInfo?.decimals || 18) : priceInfo?.buyAmount ? formatUnits(BigInt(priceInfo.buyAmount), buyTokenInfo?.decimals || 18) : ""} className="flex-1 bg-muted/30" />
          </div>
        </div>

        {priceInfo && (
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 space-y-1">
            <div className="flex justify-between"><span>Price</span><span>1 {sellTokenInfo?.symbol || "Token"} ≈ {Number(priceInfo.price || 0).toFixed(6)} {buyTokenInfo?.symbol || "Token"}</span></div>
            {priceInfo.gas && <div className="flex justify-between"><span>Est. Gas</span><span>{Number(priceInfo.gas).toLocaleString()}</span></div>}
          </div>
        )}

        {error && <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3"><AlertTriangle className="w-4 h-4 flex-shrink-0" /><span>{error}</span></div>}

        {!isConnected ? (
          <p className="text-center text-sm text-muted-foreground py-2">Connect your wallet to swap</p>
        ) : !quote ? (
          <div className="flex gap-2">
            <Button onClick={handleGetPrice} disabled={loading || !activeSellToken || !activeBuyToken || !sellAmount} className="flex-1" variant="outline">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />} Get Price
            </Button>
            <Button onClick={handleGetQuote} disabled={loading || !activeSellToken || !activeBuyToken || !sellAmount} className="flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />} Get Quote
            </Button>
          </div>
        ) : (
          <Button onClick={handleSwap} disabled={isSending} className="w-full" size="lg">
            {isSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            {walletChainId !== chainId ? "Switch Network & Swap" : "Confirm Swap"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function BridgePanel() {
  const { address, isConnected } = useAccount();
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

  useEffect(() => { setFromToken(fromTokens[0]?.address || ""); setBridgeQuote(null); }, [fromChainId]);
  useEffect(() => { setToToken(toTokens[0]?.address || ""); setBridgeQuote(null); }, [toChainId]);

  const fromTokenInfo = fromTokens.find(t => t.address === fromToken);

  const handleQuote = async () => {
    if (!amount || Number(amount) <= 0) return;
    const decimals = fromTokenInfo?.decimals || 18;
    const rawAmount = BigInt(Math.floor(Number(amount) * 10 ** decimals)).toString();
    const result = await getBridgeQuote(fromChainId, toChainId, fromToken, toToken, rawAmount, address);
    if (result) setBridgeQuote(result);
  };

  const handleBridge = async () => {
    if (!bridgeQuote?.transactionRequest) { toast.error("No transaction data"); return; }
    try {
      const tx = bridgeQuote.transactionRequest;
      sendTransaction({ to: tx.to as `0x${string}`, data: tx.data as `0x${string}`, value: BigInt(tx.value || "0") });
      toast.success("Bridge transaction submitted!");
    } catch (e: any) { toast.error(e.message || "Bridge failed"); }
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
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">From</label>
          <div className="flex gap-2">
            <Select value={String(fromChainId)} onValueChange={v => setFromChainId(Number(v))}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>{supportedChains.map(c => <SelectItem key={c.id} value={String(c.id)} disabled={c.id === toChainId}>{c.icon} {c.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={fromToken} onValueChange={v => { setFromToken(v); setBridgeQuote(null); }}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>{fromTokens.map(t => <SelectItem key={t.address} value={t.address}>{t.symbol}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" placeholder="0.0" value={amount} onChange={e => { setAmount(e.target.value); setBridgeQuote(null); }} className="flex-1" />
          </div>
        </div>

        <div className="flex justify-center"><ArrowRight className="w-5 h-5 text-muted-foreground" /></div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">To</label>
          <div className="flex gap-2">
            <Select value={String(toChainId)} onValueChange={v => setToChainId(Number(v))}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>{supportedChains.map(c => <SelectItem key={c.id} value={String(c.id)} disabled={c.id === fromChainId}>{c.icon} {c.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={toToken} onValueChange={v => { setToToken(v); setBridgeQuote(null); }}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>{toTokens.map(t => <SelectItem key={t.address} value={t.address}>{t.symbol}</SelectItem>)}</SelectContent>
            </Select>
            <Input readOnly placeholder="0.0" value={bridgeQuote?.estimate?.toAmount ? formatUnits(BigInt(bridgeQuote.estimate.toAmount), toTokens.find(t => t.address === toToken)?.decimals || 18) : ""} className="flex-1 bg-muted/30" />
          </div>
        </div>

        {bridgeQuote && (
          <div className="text-xs bg-muted/30 rounded-lg p-3 space-y-1">
            <div className="flex justify-between text-muted-foreground"><span>Provider</span><Badge variant="secondary" className="text-xs">{bridgeQuote.tool || "Best Route"}</Badge></div>
            {bridgeQuote.estimate?.executionDuration && <div className="flex justify-between text-muted-foreground"><span>Est. Time</span><span>{Math.ceil(bridgeQuote.estimate.executionDuration / 60)} min</span></div>}
          </div>
        )}

        {error && <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3"><AlertTriangle className="w-4 h-4 flex-shrink-0" /><span>{error}</span></div>}

        {!isConnected ? (
          <p className="text-center text-sm text-muted-foreground py-2">Connect your wallet to bridge</p>
        ) : !bridgeQuote ? (
          <Button onClick={handleQuote} disabled={loading || !amount || fromChainId === toChainId} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />} Get Bridge Quote
          </Button>
        ) : (
          <Button onClick={handleBridge} disabled={isSending} className="w-full" size="lg">
            {isSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />} Confirm Bridge
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function Trade() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Trade</h1>
          <p className="text-muted-foreground mt-1">Swap any token on any chain · Bridge across networks · No limits</p>
        </div>

        <Tabs defaultValue="swap" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="swap" className="gap-2"><ArrowDownUp className="w-4 h-4" /> Swap</TabsTrigger>
            <TabsTrigger value="bridge" className="gap-2"><Globe className="w-4 h-4" /> Bridge</TabsTrigger>
          </TabsList>
          <TabsContent value="swap"><SwapPanel /></TabsContent>
          <TabsContent value="bridge"><BridgePanel /></TabsContent>
        </Tabs>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>Powered by decentralized liquidity · No fees from Oracle Bull · Paste any contract address to trade</p>
        </div>
      </div>
    </Layout>
  );
}
