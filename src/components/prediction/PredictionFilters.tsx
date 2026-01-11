import { Search, SlidersHorizontal, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface PredictionFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: 'all' | 'bullish' | 'bearish' | 'neutral';
  onCategoryChange: (value: 'all' | 'bullish' | 'bearish' | 'neutral') => void;
  selectedTimeframe: 'all' | 'daily' | 'weekly' | 'monthly';
  onTimeframeChange: (value: 'all' | 'daily' | 'weekly' | 'monthly') => void;
  confidenceFilter: 'all' | '80' | '60' | '40';
  onConfidenceChange: (value: 'all' | '80' | '60' | '40') => void;
  sortBy: 'confidence' | 'change' | 'marketCap' | 'name';
  onSortChange: (value: 'confidence' | 'change' | 'marketCap' | 'name') => void;
  onRefresh: () => void;
  isFetching: boolean;
  totalResults: number;
}

export function PredictionFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedTimeframe,
  onTimeframeChange,
  confidenceFilter,
  onConfidenceChange,
  sortBy,
  onSortChange,
  onRefresh,
  isFetching,
  totalResults
}: PredictionFiltersProps) {
  return (
    <div className="holo-card p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold">Filter Predictions</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {totalResults} coins
        </Badge>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name or ticker..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-card/50 border-primary/20"
        />
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Select value={selectedTimeframe} onValueChange={(v) => onTimeframeChange(v as any)}>
          <SelectTrigger className="bg-card/50 border-primary/20">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Timeframes</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>

        <Select value={confidenceFilter} onValueChange={(v) => onConfidenceChange(v as any)}>
          <SelectTrigger className="bg-card/50 border-primary/20">
            <SelectValue placeholder="Confidence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Confidence</SelectItem>
            <SelectItem value="80">High (80%+)</SelectItem>
            <SelectItem value="60">Medium (60%+)</SelectItem>
            <SelectItem value="40">Low (40%+)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => onSortChange(v as any)}>
          <SelectTrigger className="bg-card/50 border-primary/20">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="confidence">Confidence</SelectItem>
            <SelectItem value="change">24h Change</SelectItem>
            <SelectItem value="marketCap">Market Cap</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={isFetching}
          className="border-primary/20"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Bias Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange('all')}
          className="border-primary/20"
        >
          All Signals
        </Button>
        <Button
          variant={selectedCategory === 'bullish' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange('bullish')}
          className={selectedCategory === 'bullish' ? 'bg-green-600 hover:bg-green-700' : 'border-green-600/30'}
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          Bullish
        </Button>
        <Button
          variant={selectedCategory === 'bearish' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange('bearish')}
          className={selectedCategory === 'bearish' ? 'bg-red-600 hover:bg-red-700' : 'border-red-600/30'}
        >
          <TrendingDown className="w-3 h-3 mr-1" />
          Bearish
        </Button>
        <Button
          variant={selectedCategory === 'neutral' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange('neutral')}
          className={selectedCategory === 'neutral' ? 'bg-yellow-600 hover:bg-yellow-700' : 'border-yellow-600/30'}
        >
          <Minus className="w-3 h-3 mr-1" />
          Neutral
        </Button>
      </div>
    </div>
  );
}
