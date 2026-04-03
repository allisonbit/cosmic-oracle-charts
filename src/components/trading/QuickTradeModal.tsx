import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowDownUp, ArrowRight, Globe, Loader2, Zap, RefreshCw, CheckCircle2, AlertTriangle, Wallet, Plus } from "lucide-react";
import { useAccount, useSendTransaction, useSwitchChain, useConnect } from "wagmi";
import { formatUnits } from "viem";
import { useTrading } from "@/hooks/useTrading";
import { useTrade } from "@/contexts/TradeContext";
import { toast } from "sonner";
import { POPULAR_TOKENS, CHAIN_NAME_TO_ID } from "@/lib/tradingTokens";

export function QuickTradeModal() {
  const { isOpen, target, closeTrade } = useTrade();
  const { address, isConnected, chainId: walletChainId } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { switchChain } = useSwitchChain();
  const { sendTransaction, isPending: isSending } = useSendTransaction();
  const { loading, error, getSwapQuote, getSwapPrice, getBridgeQuote, supportedChains } = useTrading();

  const defaultTab = target?.action === "bridge" ? "bridge" : "swap";
  const [tab, setTab] = useState(defaultTab);
  const [chainId, setChainId] = useState(1);
  const [sellToken, setSellToken] = useState("");
  const [buyToken, setBuyToken] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [quote, setQuote] = useState<any>(null);
  const [priceInfo, setPriceInfo] = useState<any>(null);
  const [customBuyAddress, setCustomBuyAddress] = useState("");
  const [showCustomBuy, setShowCustomBuy] = useState(false);

  // Bridge state
  const [fromChainId, setFromChainId] = useState(1);
  const [toChainId, setToChainId] = useState(8453);
  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [bridgeAmount, setBridgeAmount] = useState("");
  const [bridgeQuote, setBridgeQuote] = useState<any>(null);

  useEffect(() => {
    if (!target) return;
    setTab(target.action === "bridge" ? "bridge" : "swap");

    const cid = target.chainId || CHAIN_NAME_TO_ID[target.chain?.toLowerCase() || ""] || 1;
    setChainId(cid);
    setFromChainId(cid);

    const tokens = POPULAR_TOKENS[cid] || POPULAR_TOKENS[1];

    if (target.action === "sell" && target.contractAddress) {
      setSellToken(target.contractAddress);
      setBuyToken(tokens.find(t => t.symbol === "USDC")?.address || tokens[0]?.address || "");
      setShowCustomBuy(false);
    } else if (target.contractAddress) {
      setSellToken(tokens[0]?.address || "");
      // Check if contract is in our list
      const found = tokens.find(t => t.address.toLowerCase() === target.contractAddress?.toLowerCase());
      if (found) {
        setBuyToken(found.address);
        setShowCustomBuy(false);
      } else {
        setCustomBuyAddress(target.contractAddress);
        setShowCustomBuy(true);
        setBuyToken("");
      }
    } else {
      setSellToken(tokens[0]?.address || "");
      setBuyToken(tokens.find(t => t.symbol === "USDC")?.address || tokens[1]?.address || "");
      setShowCustomBuy(false);
    }

    setFromToken(tokens[0]?.address || "");
    const toTokens = POPULAR_TOKENS[toChainId] || POPULAR_TOKENS[8453];
    setToToken(toTokens[0]?.address || "");

    setSellAmount("");
    setQuote(null);
    setPriceInfo(null);
    setBridgeQuote(null);
    setBridgeAmount("");
  }, [target]);

  const tokens = POPULAR_TOKENS[chainId] || POPULAR_TOKENS[1];
  const activeBuyToken = showCustomBuy && customBuyAddress.startsWith("0x") ? customBuyAddress : buyToken;
  const sellTokenInfo = tokens.find(t => t.address.toLowerCase() === sellToken.toLowerCase());
  const buyTokenInfo = tokens.find(t => t.address.toLowerCase() === activeBuyToken.toLowerCase());
  const fromTokens = POPULAR_TOKENS[fromChainId] || POPULAR_TOKENS[1];
  const toTokens = POPULAR_TOKENS[toChainId] || POPULAR_TOKENS[8453];
  const fromTokenInfo = fromTokens.find(t => t.address === fromToken);

  const handleGetPrice = useCallback(async () => {
    if (!sellToken || !activeBuyToken || !sellAmount || Number(sellAmount) <= 0) return;
    const decimals = sellTokenInfo?.decimals || 18;
    const rawAmount = BigInt(Math.floor(Number(sellAmount) * 10 ** decimals)).toString();
    const result = await getSwapPrice(chainId, sellToken, activeBuyToken, rawAmount);
    if (result) setPriceInfo(result);
  }, [chainId, sellToken, activeBuyToken, sellAmount, sellTokenInfo, getSwapPrice]);

  const handleGetQuote = useCallback(async () => {
    if (!sellToken || !activeBuyToken || !sellAmount || !address) return;
    const decimals = sellTokenInfo?.decimals || 18;
    const rawAmount = BigInt(Math.floor(Number(sellAmount) * 10 ** decimals)).toString();
    const result = await getSwapQuote(chainId, sellToken, activeBuyToken, rawAmount, address);
    if (result) setQuote(result);
  }, [chainId, sellToken, activeBuyToken, sellAmount, address, sellTokenInfo, getSwapQuote]);

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

  const handleBridgeQuote = async () => {
    if (!bridgeAmount || Number(bridgeAmount) <= 0) return;
    const decimals = fromTokenInfo?.decimals || 18;
    const rawAmount = BigInt(Math.floor(Number(bridgeAmount) * 10 ** decimals)).toString();
    const result = await getBridgeQuote(fromChainId, toChainId, fromToken, toToken, rawAmount, address);
    if (result) setBridgeQuote(result);
  };

  const handleBridge = async () => {
    if (!bridgeQuote?.transactionRequest) { toast.error("No transaction data"); return; }
    try {
      const tx = bridgeQuote.transactionRequest;
      sendTransaction({ to: tx.to as `0x${string}`, data: tx.data as `0x${string}`, value: BigInt(tx.value || "0") });
      toast.success("Bridge submitted!");
    } catch (e: any) { toast.error(e.message || "Bridge failed"); }
  };

  const handleConnect = () => {
    const connector = connectors.find(c => c.id === 'walletConnect' || c.id === 'injected') || connectors[0];
    if (connector) connect({ connector });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeTrade(); }}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {target?.logo && <img src={target.logo} alt={target.symbol} className="w-6 h-6 rounded-full" />}
            <span>Trade {target?.symbol || "Tokens"}</span>
            {target?.name && <span className="text-sm text-muted-foreground font-normal">({target.name})</span>}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="swap">Swap</TabsTrigger>
            <TabsTrigger value="bridge">Bridge</TabsTrigger>
          </TabsList>

          {/* SWAP TAB */}
          <TabsContent value="swap" className="space-y-3 mt-3">
            <Select value={String(chainId)} onValueChange={v => { setChainId(Number(v)); setQuote(null); setPriceInfo(null); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {supportedChains.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.icon} {c.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">You pay</label>
              <div className="flex gap-2">
                <Select value={sellToken} onValueChange={v => { setSellToken(v); setQuote(null); }}>
                  <SelectTrigger className="w-[120px]"><SelectValue placeholder="Token" /></SelectTrigger>
                  <SelectContent>{tokens.map(t => <SelectItem key={t.address} value={t.address} disabled={t.address === activeBuyToken}>{t.symbol}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" placeholder="0.0" value={sellAmount} onChange={e => { setSellAmount(e.target.value); setQuote(null); setPriceInfo(null); }} className="flex-1" />
              </div>
            </div>

            <div className="flex justify-center">
              <Button variant="ghost" size="icon" className="rounded-full border border-border h-8 w-8" onClick={() => {
                const temp = sellToken;
                setSellToken(showCustomBuy ? customBuyAddress : buyToken);
                if (showCustomBuy) { setCustomBuyAddress(temp); } else { setBuyToken(temp); }
                setQuote(null); setPriceInfo(null);
              }}>
                <ArrowDownUp className="w-3 h-3" />
              </Button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">You receive</label>
                <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5" onClick={() => { setShowCustomBuy(!showCustomBuy); setQuote(null); }}>
                  <Plus className="w-2.5 h-2.5 mr-0.5" /> {showCustomBuy ? "List" : "Any token"}
                </Button>
              </div>
              <div className="flex gap-2">
                {showCustomBuy ? (
                  <Input placeholder="Paste contract (0x...)" value={customBuyAddress} onChange={e => { setCustomBuyAddress(e.target.value); setQuote(null); }} className="w-[120px] text-xs" />
                ) : (
                  <Select value={buyToken} onValueChange={v => { setBuyToken(v); setQuote(null); }}>
                    <SelectTrigger className="w-[120px]"><SelectValue placeholder="Token" /></SelectTrigger>
                    <SelectContent>{tokens.map(t => <SelectItem key={t.address} value={t.address} disabled={t.address === sellToken}>{t.symbol}</SelectItem>)}</SelectContent>
                  </Select>
                )}
                <Input readOnly placeholder="0.0" value={quote ? formatUnits(BigInt(quote.buyAmount || "0"), buyTokenInfo?.decimals || 18) : priceInfo?.buyAmount ? formatUnits(BigInt(priceInfo.buyAmount), buyTokenInfo?.decimals || 18) : ""} className="flex-1 bg-muted/30" />
              </div>
            </div>

            {priceInfo && (
              <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-2 space-y-1">
                <div className="flex justify-between"><span>Price</span><span>1 {sellTokenInfo?.symbol || "?"} ≈ {Number(priceInfo.price || 0).toFixed(6)} {buyTokenInfo?.symbol || "Token"}</span></div>
                {priceInfo.gas && <div className="flex justify-between"><span>Gas</span><span>{Number(priceInfo.gas).toLocaleString()}</span></div>}
              </div>
            )}

            {error && <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg p-2"><AlertTriangle className="w-3 h-3" /><span>{error}</span></div>}

            {!isConnected ? (
              <Button onClick={handleConnect} disabled={isConnecting} className="w-full" size="sm">
                <Wallet className="w-3 h-3 mr-1" /> {isConnecting ? "Connecting..." : "Connect Wallet to Trade"}
              </Button>
            ) : !quote ? (
              <div className="flex gap-2">
                <Button onClick={handleGetPrice} disabled={loading || !sellToken || !activeBuyToken || !sellAmount} className="flex-1" variant="outline" size="sm">
                  {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />} Price
                </Button>
                <Button onClick={handleGetQuote} disabled={loading || !sellToken || !activeBuyToken || !sellAmount} className="flex-1" size="sm">
                  {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Zap className="w-3 h-3 mr-1" />} Quote
                </Button>
              </div>
            ) : (
              <Button onClick={handleSwap} disabled={isSending} className="w-full">
                {isSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                {walletChainId !== chainId ? "Switch & Swap" : "Confirm Swap"}
              </Button>
            )}
          </TabsContent>

          {/* BRIDGE TAB */}
          <TabsContent value="bridge" className="space-y-3 mt-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">From</label>
              <div className="flex gap-2">
                <Select value={String(fromChainId)} onValueChange={v => { setFromChainId(Number(v)); setBridgeQuote(null); }}>
                  <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{supportedChains.map(c => <SelectItem key={c.id} value={String(c.id)} disabled={c.id === toChainId}>{c.icon} {c.name}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={fromToken} onValueChange={v => { setFromToken(v); setBridgeQuote(null); }}>
                  <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{fromTokens.map(t => <SelectItem key={t.address} value={t.address}>{t.symbol}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" placeholder="0.0" value={bridgeAmount} onChange={e => { setBridgeAmount(e.target.value); setBridgeQuote(null); }} className="flex-1" />
              </div>
            </div>

            <div className="flex justify-center"><ArrowRight className="w-4 h-4 text-muted-foreground" /></div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">To</label>
              <div className="flex gap-2">
                <Select value={String(toChainId)} onValueChange={v => { setToChainId(Number(v)); setBridgeQuote(null); }}>
                  <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{supportedChains.map(c => <SelectItem key={c.id} value={String(c.id)} disabled={c.id === fromChainId}>{c.icon} {c.name}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={toToken} onValueChange={v => { setToToken(v); setBridgeQuote(null); }}>
                  <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{toTokens.map(t => <SelectItem key={t.address} value={t.address}>{t.symbol}</SelectItem>)}</SelectContent>
                </Select>
                <Input readOnly placeholder="0.0" value={bridgeQuote?.estimate?.toAmount ? formatUnits(BigInt(bridgeQuote.estimate.toAmount), toTokens.find(t => t.address === toToken)?.decimals || 18) : ""} className="flex-1 bg-muted/30" />
              </div>
            </div>

            {bridgeQuote && (
              <div className="text-xs bg-muted/30 rounded-lg p-2 space-y-1">
                <div className="flex justify-between text-muted-foreground"><span>Provider</span><Badge variant="secondary" className="text-[10px]">{bridgeQuote.tool || "Best Route"}</Badge></div>
                {bridgeQuote.estimate?.executionDuration && <div className="flex justify-between text-muted-foreground"><span>Est. Time</span><span>{Math.ceil(bridgeQuote.estimate.executionDuration / 60)} min</span></div>}
              </div>
            )}

            {error && <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg p-2"><AlertTriangle className="w-3 h-3" /><span>{error}</span></div>}

            {!isConnected ? (
              <Button onClick={handleConnect} disabled={isConnecting} className="w-full" size="sm">
                <Wallet className="w-3 h-3 mr-1" /> {isConnecting ? "Connecting..." : "Connect Wallet to Bridge"}
              </Button>
            ) : !bridgeQuote ? (
              <Button onClick={handleBridgeQuote} disabled={loading || !bridgeAmount} className="w-full" size="sm">
                {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Globe className="w-3 h-3 mr-1" />} Get Bridge Quote
              </Button>
            ) : (
              <Button onClick={handleBridge} disabled={isSending} className="w-full">
                {isSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />} Confirm Bridge
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
