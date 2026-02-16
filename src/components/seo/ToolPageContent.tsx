import { Link } from "react-router-dom";
import { 
  Brain, TrendingUp, Shield, Zap, Activity, Target, BarChart3, 
  AlertTriangle, BookOpen, ChevronRight, Users, Globe, LineChart,
  Layers, PieChart, Wallet, Clock, Search, DollarSign
} from "lucide-react";

// ============ SENTIMENT PAGE CONTENT ============

export function SentimentHowItWorks() {
  return (
    <section className="holo-card p-6 md:p-8 mb-8">
      <h2 className="font-display text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
        <Brain className="w-6 h-6 text-primary" />
        How Market Sentiment Analysis Works
      </h2>
      
      <div className="prose max-w-none text-muted-foreground space-y-4">
        <p>
          Market sentiment analysis is the process of measuring the overall attitude of market participants 
          toward a particular asset or the market as a whole. At OracleBull, we combine multiple data sources 
          and advanced AI algorithms to provide a comprehensive view of market psychology.
        </p>
        
        <h3 className="text-lg font-bold text-foreground mt-6 mb-3">Our Multi-Source Approach</h3>
        <p>
          Traditional sentiment analysis relies on a single metric, but markets are complex ecosystems influenced 
          by many factors. Our platform aggregates data from:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Social Media:</strong> Real-time monitoring of Twitter, Reddit, and Telegram for trending discussions and sentiment shifts</li>
          <li><strong>On-Chain Metrics:</strong> Wallet movements, exchange flows, and whale activity that indicate smart money positioning</li>
          <li><strong>News & Media:</strong> Aggregated news sentiment from 100+ crypto news sources</li>
          <li><strong>Technical Indicators:</strong> Price action, volume patterns, and volatility metrics</li>
          <li><strong>Developer Activity:</strong> GitHub commits and development progress indicating project health</li>
        </ul>

        <h3 className="text-lg font-bold text-foreground mt-6 mb-3">The Fear & Greed Index Explained</h3>
        <p>
          The Fear & Greed Index is our flagship sentiment indicator, measuring market emotion on a scale of 0-100:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>0-25 (Extreme Fear):</strong> Investors are very worried, often a signal that the market may be oversold</li>
          <li><strong>26-45 (Fear):</strong> Cautious sentiment, potential accumulation opportunity</li>
          <li><strong>46-55 (Neutral):</strong> Market is undecided, consolidation phase</li>
          <li><strong>56-75 (Greed):</strong> Optimistic sentiment, momentum building</li>
          <li><strong>76-100 (Extreme Greed):</strong> Market euphoria, often precedes corrections</li>
        </ul>

        <h3 className="text-lg font-bold text-foreground mt-6 mb-3">Why Sentiment Matters</h3>
        <p>
          Cryptocurrency markets are heavily influenced by sentiment. Unlike traditional markets with clear 
          fundamentals like earnings reports, crypto prices often move based on narratives, social trends, 
          and collective psychology. Understanding sentiment helps you:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Identify potential trend reversals before they appear in price</li>
          <li>Avoid buying during extreme greed (market tops)</li>
          <li>Find accumulation opportunities during extreme fear</li>
          <li>Understand what's driving current price movements</li>
        </ul>
      </div>
      
      <div className="mt-6 p-4 bg-warning/10 border border-warning/30 rounded-lg">
        <p className="text-sm text-muted-foreground flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <span>
            <strong className="text-warning">Important:</strong> Sentiment analysis is one tool among many. 
            High fear doesn't guarantee prices will rise, and high greed doesn't mean an immediate crash. 
            Always use sentiment in conjunction with other analysis methods.
          </span>
        </p>
      </div>
    </section>
  );
}

export function SentimentDataMeaning() {
  return (
    <section className="holo-card p-6 md:p-8 mb-8">
      <h2 className="font-display text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-secondary" />
        What This Sentiment Data Means
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 bg-muted/10 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Whale Activity
          </h3>
          <p className="text-sm text-muted-foreground">
            Large wallet movements often precede significant price action. When whales accumulate, 
            it suggests confidence in higher prices. Distribution (selling) may indicate upcoming weakness. 
            Our tracker monitors wallets holding $1M+ in assets.
          </p>
        </div>
        
        <div className="p-4 bg-muted/10 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-success" />
            Social Buzz Score
          </h3>
          <p className="text-sm text-muted-foreground">
            Measures the volume and sentiment of social media discussions. A rising buzz score with 
            positive sentiment often correlates with price increases. Sudden spikes may indicate 
            breaking news or viral momentum.
          </p>
        </div>
        
        <div className="p-4 bg-muted/10 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-warning" />
            Google Trends
          </h3>
          <p className="text-sm text-muted-foreground">
            Search interest reflects retail investor attention. Historical data shows that search 
            spikes often occur near local tops. Conversely, low search interest during accumulation 
            phases can signal undervaluation.
          </p>
        </div>
        
        <div className="p-4 bg-muted/10 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-secondary" />
            Market Momentum
          </h3>
          <p className="text-sm text-muted-foreground">
            Combines price momentum, volume trends, and sentiment direction into a single indicator. 
            Bullish momentum suggests continuation of uptrends; bearish momentum indicates potential 
            for further downside.
          </p>
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        <Link to="/dashboard" className="p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm">Market Dashboard</span>
          <ChevronRight className="w-4 h-4 ml-auto" />
        </Link>
        <Link to="/predictions" className="p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-sm">Price Predictions</span>
          <ChevronRight className="w-4 h-4 ml-auto" />
        </Link>
        <Link to="/learn" className="p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-sm">Learn More</span>
          <ChevronRight className="w-4 h-4 ml-auto" />
        </Link>
      </div>
    </section>
  );
}

// ============ EXPLORER PAGE CONTENT ============

export function ExplorerHowItWorks() {
  return (
    <section className="holo-card p-6 md:p-8 mb-8">
      <h2 className="font-display text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
        <Search className="w-6 h-6 text-primary" />
        How Token Tracking Works
      </h2>
      
      <div className="prose max-w-none text-muted-foreground space-y-4">
        <p>
          The Token Explorer is your universal gateway to cryptocurrency data across 30+ blockchains. 
          Whether you're researching a new DeFi token, tracking your portfolio holdings, or discovering 
          trending opportunities, our explorer provides the intelligence you need.
        </p>
        
        <h3 className="text-lg font-bold text-foreground mt-6 mb-3">Multi-Chain Architecture</h3>
        <p>
          Unlike single-chain explorers, OracleBull aggregates data from every major blockchain ecosystem:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>EVM Chains:</strong> Ethereum, Arbitrum, Base, Polygon, Optimism, Avalanche, BNB Chain</li>
          <li><strong>Non-EVM:</strong> Solana, Bitcoin, Cosmos ecosystem, Near, Sui, Aptos</li>
          <li><strong>Layer 2s:</strong> All major L2 solutions with bridge activity tracking</li>
        </ul>

        <h3 className="text-lg font-bold text-foreground mt-6 mb-3">Search Capabilities</h3>
        <p>
          Our intelligent search understands multiple input formats:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Contract Addresses:</strong> Paste any contract address and we'll identify the chain automatically</li>
          <li><strong>Token Names:</strong> Search by full name (e.g., "Ethereum" or "Uniswap")</li>
          <li><strong>Ticker Symbols:</strong> Quick lookup by symbol (e.g., "ETH", "UNI", "SOL")</li>
          <li><strong>Partial Matches:</strong> Fuzzy search finds relevant tokens even with typos</li>
        </ul>

        <h3 className="text-lg font-bold text-foreground mt-6 mb-3">Data We Provide</h3>
        <p>
          For every token, our explorer delivers comprehensive market intelligence:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Real-time price with historical charts</li>
          <li>24-hour trading volume and volume trends</li>
          <li>Market capitalization and fully diluted valuation</li>
          <li>Liquidity depth and pool information</li>
          <li>Holder count and distribution metrics</li>
          <li>AI-powered risk assessment and predictions</li>
        </ul>
      </div>
    </section>
  );
}

export function ExplorerDataMeaning() {
  return (
    <section className="holo-card p-6 md:p-8 mb-8">
      <h2 className="font-display text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
        <LineChart className="w-6 h-6 text-secondary" />
        Interpreting Token Metrics
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 bg-muted/10 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-success" />
            Market Cap vs FDV
          </h3>
          <p className="text-sm text-muted-foreground">
            Market Cap reflects current circulating supply × price. Fully Diluted Valuation (FDV) 
            includes all tokens that will ever exist. A large gap between them suggests significant 
            future supply inflation that may pressure prices.
          </p>
        </div>
        
        <div className="p-4 bg-muted/10 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Liquidity Depth
          </h3>
          <p className="text-sm text-muted-foreground">
            Shows how much capital is available for trading. Deep liquidity means you can buy/sell 
            without significantly moving the price. Low liquidity tokens are riskier and more 
            susceptible to manipulation.
          </p>
        </div>
        
        <div className="p-4 bg-muted/10 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-warning" />
            Holder Concentration
          </h3>
          <p className="text-sm text-muted-foreground">
            Reveals how token ownership is distributed. High concentration (few wallets holding most 
            supply) indicates higher risk of dumps. Broader distribution suggests more stable 
            price action and community ownership.
          </p>
        </div>
        
        <div className="p-4 bg-muted/10 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-secondary" />
            Volume/Market Cap Ratio
          </h3>
          <p className="text-sm text-muted-foreground">
            High ratio indicates active trading interest; low ratio may suggest illiquidity or 
            lack of interest. Compare this metric across similar tokens to gauge relative activity.
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
        <h4 className="font-bold mb-2">Pro Tip: Research Checklist</h4>
        <p className="text-sm text-muted-foreground">
          Before investing in any token, verify: contract is verified on the block explorer, 
          liquidity is locked or sufficient, team is doxxed or has a track record, 
          tokenomics don't have excessive inflation, and there's genuine utility beyond speculation.
        </p>
      </div>
    </section>
  );
}

// ============ PREDICTIONS PAGE CONTENT ============

export function PredictionsHowItWorks() {
  return (
    <section className="holo-card p-6 md:p-8 mb-8">
      <h2 className="font-display text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
        <Target className="w-6 h-6 text-primary" />
        How AI Market Analysis Works
      </h2>
      
      <div className="prose max-w-none text-muted-foreground space-y-4">
        <p>
          OracleBull's AI market analysis system combines technical analysis, on-chain data, and sentiment 
          indicators to generate comprehensive market insights for over 1,000 cryptocurrencies. Our models 
          are trained on years of historical data and updated in real-time.
        </p>
        
        <h3 className="text-lg font-bold text-foreground mt-6 mb-3">Our Analysis Methodology</h3>
        <p>
          Each analysis incorporates multiple layers of data:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Technical Indicators (40%):</strong> RSI, MACD, Bollinger Bands, Moving Averages, Fibonacci levels, support/resistance zones</li>
          <li><strong>On-Chain Metrics (30%):</strong> Whale movements, exchange flows, active addresses, transaction volume</li>
          <li><strong>Sentiment Analysis (20%):</strong> Social media trends, news sentiment, fear & greed index</li>
          <li><strong>Market Structure (10%):</strong> Correlation with BTC, sector performance, macro factors</li>
        </ul>

        <h3 className="text-lg font-bold text-foreground mt-6 mb-3">Timeframe Analysis</h3>
        <p>
          We provide analysis across three timeframes to serve different strategies:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Daily Analysis:</strong> Intraday insights for active traders, updated every hour with key levels and momentum</li>
          <li><strong>Weekly Analysis:</strong> Swing trading perspective with breakout/breakdown zones and trend direction</li>
          <li><strong>Monthly Analysis:</strong> Investment outlook incorporating macro trends, major support/resistance, and sector rotation</li>
        </ul>

        <h3 className="text-lg font-bold text-foreground mt-6 mb-3">Understanding Our Bias Ratings</h3>
        <p>
          Each analysis includes a bias rating that reflects our AI's directional outlook:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Bullish:</strong> Technical and sentiment factors favor upside. Key levels to watch for entries are provided.</li>
          <li><strong>Bearish:</strong> Indicators suggest potential downside. Risk management levels are highlighted.</li>
          <li><strong>Neutral:</strong> Mixed signals or consolidation. Wait for clearer direction before positioning.</li>
        </ul>

        <h3 className="text-lg font-bold text-foreground mt-6 mb-3">Confidence Scores</h3>
        <p>
          Our confidence score (0-100%) indicates how strongly our model believes in the analysis:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>80%+:</strong> Strong conviction - multiple indicators align</li>
          <li><strong>60-79%:</strong> Moderate conviction - some conflicting signals</li>
          <li><strong>Below 60%:</strong> Low conviction - high uncertainty, smaller position sizes recommended</li>
        </ul>
      </div>
      
      <div className="mt-6 p-4 bg-danger/10 border border-danger/30 rounded-lg">
        <p className="text-sm text-muted-foreground flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
          <span>
            <strong className="text-danger">Risk Disclaimer:</strong> AI analysis is not financial advice. 
            Past performance does not guarantee future results. Cryptocurrency investments carry high risk. 
            Always do your own research and consider your risk tolerance before making any investment decisions.
          </span>
        </p>
      </div>
    </section>
  );
}

export function PredictionsDataMeaning() {
  return (
    <section className="holo-card p-6 md:p-8 mb-8">
      <h2 className="font-display text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-secondary" />
        Interpreting Analysis Data
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 bg-muted/10 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-success" />
            Support Levels
          </h3>
          <p className="text-sm text-muted-foreground">
            Price zones where buying pressure historically emerges. These levels often act as floors 
            during pullbacks. A break below support may signal further downside and trigger stop-losses.
          </p>
        </div>
        
        <div className="p-4 bg-muted/10 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Resistance Levels
          </h3>
          <p className="text-sm text-muted-foreground">
            Price zones where selling pressure typically appears. Breaking above resistance often 
            leads to accelerated upside as shorts cover and new buyers enter on momentum.
          </p>
        </div>
        
        <div className="p-4 bg-muted/10 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-warning" />
            Risk Score
          </h3>
          <p className="text-sm text-muted-foreground">
            Our proprietary risk metric considers volatility, liquidity, market cap, and historical 
            drawdowns. Higher risk scores (7-10) indicate extreme volatility - position sizes should 
            be adjusted accordingly.
          </p>
        </div>
        
        <div className="p-4 bg-muted/10 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-secondary" />
            Update Frequency
          </h3>
          <p className="text-sm text-muted-foreground">
            Daily analysis updates every 4 hours, weekly on Sundays, and monthly on the 1st. 
            Significant market events may trigger off-cycle updates. Always check the timestamp 
            for the most current data.
          </p>
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        <Link to="/sentiment" className="p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-sm">Sentiment Data</span>
          <ChevronRight className="w-4 h-4 ml-auto" />
        </Link>
        <Link to="/strength" className="p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm">Strength Meter</span>
          <ChevronRight className="w-4 h-4 ml-auto" />
        </Link>
        <Link to="/factory" className="p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-sm">Market Events</span>
          <ChevronRight className="w-4 h-4 ml-auto" />
        </Link>
      </div>
    </section>
  );
}

// ============ DASHBOARD EXTENDED CONTENT ============

export function DashboardHowItWorks() {
  return (
    <section className="holo-card p-6 md:p-8 mb-8">
      <h2 className="font-display text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
        <PieChart className="w-6 h-6 text-primary" />
        Understanding the Market Dashboard
      </h2>
      
      <div className="prose max-w-none text-muted-foreground space-y-4">
        <p>
          The OracleBull Dashboard is your command center for cryptocurrency market intelligence. 
          We've designed it to deliver institutional-grade data in an accessible format, helping 
          you make informed decisions without information overload.
        </p>
        
        <h3 className="text-lg font-bold text-foreground mt-6 mb-3">Dashboard Components</h3>
        
        <h4 className="font-bold text-foreground mt-4 mb-2">Market Overview</h4>
        <p>
          The top section displays global market metrics: total market capitalization, 24-hour 
          trading volume, Bitcoin dominance, and the Fear & Greed Index. These provide immediate 
          context for the overall market environment.
        </p>

        <h4 className="font-bold text-foreground mt-4 mb-2">Price Cards</h4>
        <p>
          Individual cryptocurrency cards show real-time prices, percentage changes, and mini-charts. 
          Click any card for detailed analysis including support/resistance levels and AI insights.
        </p>

        <h4 className="font-bold text-foreground mt-4 mb-2">Market Momentum</h4>
        <p>
          Our momentum indicator aggregates multiple signals to show whether the market is in 
          bullish, bearish, or neutral territory. Green indicates positive momentum, red indicates 
          selling pressure, and yellow suggests consolidation.
        </p>

        <h4 className="font-bold text-foreground mt-4 mb-2">Volume Leaders</h4>
        <p>
          Highlights cryptocurrencies with unusual volume activity. High volume confirms price 
          movements and can signal the start of new trends. We compare current volume against 
          20-day averages to identify anomalies.
        </p>

        <h4 className="font-bold text-foreground mt-4 mb-2">Dominance Chart</h4>
        <p>
          Shows market share distribution among major cryptocurrencies. Rising Bitcoin dominance 
          typically indicates a risk-off environment where capital flows to perceived safety. 
          Declining BTC dominance often signals the beginning of an "altseason."
        </p>

        <h3 className="text-lg font-bold text-foreground mt-6 mb-3">Using the Dashboard Effectively</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Check the Fear & Greed Index first for overall market sentiment context</li>
          <li>Review momentum indicators to understand the current trend direction</li>
          <li>Identify volume anomalies that may signal emerging opportunities</li>
          <li>Use dominance charts to gauge risk appetite in the market</li>
          <li>Click through to detailed analysis pages for specific trading insights</li>
        </ul>
      </div>
    </section>
  );
}

// ============ STRENGTH METER CONTENT ============

export function StrengthMeterHowItWorks() {
  return (
    <section className="holo-card p-6 md:p-8 mb-8">
      <h2 className="font-display text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
        <Zap className="w-6 h-6 text-primary" />
        How the Crypto Strength Meter Works
      </h2>
      
      <div className="prose max-w-none text-muted-foreground space-y-4">
        <p>
          The Crypto Strength Meter is a real-time ranking system that measures the relative 
          strength of cryptocurrencies based on multiple weighted factors. Unlike simple price 
          change rankings, our strength meter provides a holistic view of asset momentum.
        </p>
        
        <h3 className="text-lg font-bold text-foreground mt-6 mb-3">Strength Calculation</h3>
        <p>
          Our proprietary algorithm combines three key components:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Momentum Score (40%):</strong> Rate of price change relative to historical volatility</li>
          <li><strong>Volume Score (35%):</strong> Current volume compared to 20-day average, indicating conviction</li>
          <li><strong>Sentiment Score (25%):</strong> Social and on-chain sentiment indicators</li>
        </ul>

        <h3 className="text-lg font-bold text-foreground mt-6 mb-3">Reading the Meter</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>90-100:</strong> Extremely strong - potential overbought territory</li>
          <li><strong>70-89:</strong> Strong momentum - trend likely to continue</li>
          <li><strong>50-69:</strong> Neutral range - watching for breakout direction</li>
          <li><strong>30-49:</strong> Weak momentum - potential reversal zone</li>
          <li><strong>0-29:</strong> Extremely weak - potential oversold conditions</li>
        </ul>

        <h3 className="text-lg font-bold text-foreground mt-6 mb-3">Strategic Applications</h3>
        <p>
          The Strength Meter helps identify:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Assets with building momentum before major moves</li>
          <li>Potential rotation opportunities between strong and weak sectors</li>
          <li>Divergences between price and underlying strength</li>
          <li>Confirmation signals for technical analysis setups</li>
        </ul>
      </div>
    </section>
  );
}

// ============ FACTORY CONTENT ============

export function FactoryHowItWorks() {
  return (
    <section className="holo-card p-6 md:p-8 mb-8">
      <h2 className="font-display text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
        <Globe className="w-6 h-6 text-primary" />
        How Market Intelligence Works
      </h2>
      
      <div className="prose max-w-none text-muted-foreground space-y-4">
        <p>
          The Crypto Factory is OracleBull's market intelligence aggregator, combining multiple 
          data streams into actionable insights. We monitor over 50 news sources, on-chain events, 
          and market narratives to keep you informed of market-moving developments.
        </p>
        
        <h3 className="text-lg font-bold text-foreground mt-6 mb-3">Intelligence Categories</h3>
        
        <h4 className="font-bold text-foreground mt-4 mb-2">Market Events</h4>
        <p>
          Token unlocks, protocol upgrades, airdrops, and scheduled events that may impact prices. 
          We track event dates, expected impact, and historical precedent for similar events.
        </p>

        <h4 className="font-bold text-foreground mt-4 mb-2">On-Chain Intelligence</h4>
        <p>
          Real-time monitoring of smart money movements, exchange flows, and notable wallet activity. 
          See what whales are buying and selling before it becomes common knowledge.
        </p>

        <h4 className="font-bold text-foreground mt-4 mb-2">Market Narratives</h4>
        <p>
          Emerging themes and trends gaining traction in the crypto space. From new technological 
          developments to regulatory shifts, we identify narratives that may drive the next market cycle.
        </p>

        <h4 className="font-bold text-foreground mt-4 mb-2">News Aggregation</h4>
        <p>
          Curated news from 50+ trusted crypto publications, filtered for relevance and impact. 
          Our AI categorizes and prioritizes news so you see what matters most first.
        </p>
      </div>
    </section>
  );
}
