import { useState, useEffect, useRef } from "react";
import { Search, X, QrCode, Loader2, Sparkles, Hash, FileText, Globe2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { detectInputType, detectChainFromAddress } from "@/lib/explorerChains";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  isLoading?: boolean;
  onDetectedChain?: (chainId: string) => void;
}

export function SearchInput({ value, onChange, onClear, isLoading, onDetectedChain }: SearchInputProps) {
  const [inputType, setInputType] = useState<'contract' | 'symbol' | 'name' | 'ens'>('name');
  const [detectedChain, setDetectedChain] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value.trim()) {
      const type = detectInputType(value);
      setInputType(type);

      if (type === 'contract') {
        const chain = detectChainFromAddress(value);
        setDetectedChain(chain);
        if (chain && onDetectedChain) {
          onDetectedChain(chain);
        }
      } else {
        setDetectedChain(null);
      }
    } else {
      setInputType('name');
      setDetectedChain(null);
    }
  }, [value, onDetectedChain]);

  const getTypeIcon = () => {
    switch (inputType) {
      case 'contract': return <Hash className="w-4 h-4" />;
      case 'symbol': return <Sparkles className="w-4 h-4" />;
      case 'ens': return <Globe2 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = () => {
    switch (inputType) {
      case 'contract': return 'Contract';
      case 'symbol': return 'Symbol';
      case 'ens': return 'ENS';
      default: return 'Name';
    }
  };

  const getPlaceholder = () => {
    return "Search: contract address, token name, symbol (ETH, BTC), or ENS domain...";
  };

  return (
    <div className="relative">
      {/* Input Type Indicator */}
      {value && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-primary z-10">
          {getTypeIcon()}
          <span className="text-xs font-display hidden sm:inline">{getTypeLabel()}</span>
        </div>
      )}
      
      {/* Search Icon (when empty) */}
      {!value && (
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      )}

      <Input
        ref={inputRef}
        type="text"
        placeholder={getPlaceholder()}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-14 text-base bg-muted/50 border-primary/30 focus:border-primary pr-32",
          value ? "pl-20 sm:pl-24" : "pl-12"
        )}
      />

      {/* Right Side Controls */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {/* Chain Detection Badge */}
        {detectedChain && (
          <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success hidden sm:inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            {detectedChain.charAt(0).toUpperCase() + detectedChain.slice(1)} detected
          </span>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        )}

        {/* Clear Button */}
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-8"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Hints */}
      {!value && (
        <div className="absolute left-0 right-0 -bottom-6 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> Contract</span>
          <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Symbol</span>
          <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Name</span>
          <span className="flex items-center gap-1"><Globe2 className="w-3 h-3" /> ENS</span>
        </div>
      )}
    </div>
  );
}
