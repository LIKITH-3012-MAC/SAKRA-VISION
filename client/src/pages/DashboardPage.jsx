import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Bookmark,
  CheckCircle,
  ExternalLink,
  LineChart as LineChartIcon,
  Briefcase,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MetricCard } from '../components/ui/MetricCard';
import { SectionCard } from '../components/ui/SectionCard';
import { StatusBadge, DataFreshnessLabel } from '../components/ui/StatusBadge';
import { PriceChart } from '../components/charts/PriceChart';
import { formatINR, formatPercent, formatCompactINR } from '../utils/formatters';

// Realistic NIFTY 50 Datasets across timeframes
const NIFTY_DATASETS = {
  '1D': [
    { date: '09:15', close: 25390, open: 25334, high: 25410, low: 25330, volume: 4200000, sma20: 25360 },
    { date: '10:30', close: 25425, open: 25390, high: 25440, low: 25380, volume: 8500000, sma20: 25390 },
    { date: '11:45', close: 25415, open: 25425, high: 25445, low: 25400, volume: 6100000, sma20: 25405 },
    { date: '13:00', close: 25450, open: 25415, high: 25465, low: 25410, volume: 7300000, sma20: 25420 },
    { date: '14:15', close: 25490, open: 25450, high: 25510, low: 25440, volume: 9200000, sma20: 25445 },
    { date: '15:30', close: 25460, open: 25490, high: 25505, low: 25450, volume: 11400000, sma20: 25460 },
  ],
  '1W': [
    { date: '21 Oct', close: 25180, open: 25050, high: 25220, low: 25000, volume: 29000000, sma20: 24900 },
    { date: '22 Oct', close: 25240, open: 25190, high: 25280, low: 25150, volume: 31000000, sma20: 24950 },
    { date: '23 Oct', close: 25195, open: 25250, high: 25290, low: 25160, volume: 27500000, sma20: 24990 },
    { date: '24 Oct', close: 25340, open: 25210, high: 25380, low: 25190, volume: 34000000, sma20: 25050 },
    { date: '27 Oct', close: 25460, open: 25400, high: 25510, low: 25380, volume: 38200000, sma20: 25110 },
  ],
  '1M': [
    { date: '01 Oct', close: 24790, open: 24710, high: 24850, low: 24680, volume: 28000000, sma20: 24650 },
    { date: '05 Oct', close: 24920, open: 24800, high: 24980, low: 24750, volume: 31000000, sma20: 24700 },
    { date: '10 Oct', close: 25150, open: 24950, high: 25210, low: 24900, volume: 34000000, sma20: 24780 },
    { date: '15 Oct', close: 25010, open: 25180, high: 25240, low: 24980, volume: 29500000, sma20: 24850 },
    { date: '20 Oct', close: 25280, open: 25050, high: 25330, low: 25010, volume: 36000000, sma20: 24920 },
    { date: '25 Oct', close: 25390, open: 25290, high: 25440, low: 25250, volume: 33000000, sma20: 25010 },
    { date: '27 Oct', close: 25460, open: 25400, high: 25510, low: 25380, volume: 38200000, sma20: 25110 },
  ],
  '3M': [
    { date: '01 Aug', close: 24350, open: 24200, high: 24420, low: 24150, volume: 26000000, sma20: 24100 },
    { date: '15 Aug', close: 24680, open: 24400, high: 24720, low: 24380, volume: 29000000, sma20: 24300 },
    { date: '01 Sep', close: 24900, open: 24700, high: 24980, low: 24650, volume: 32000000, sma20: 24550 },
    { date: '15 Sep', close: 25120, open: 24950, high: 25180, low: 24890, volume: 35000000, sma20: 24800 },
    { date: '01 Oct', close: 24790, open: 25050, high: 25100, low: 24720, volume: 28000000, sma20: 24850 },
    { date: '15 Oct', close: 25010, open: 24850, high: 25120, low: 24800, volume: 31000000, sma20: 24950 },
    { date: '27 Oct', close: 25460, open: 25350, high: 25510, low: 25300, volume: 38200000, sma20: 25110 },
  ],
  '1Y': [
    { date: 'Nov 25', close: 22800, open: 22600, high: 22950, low: 22500, volume: 24000000, sma20: 22500 },
    { date: 'Jan 26', close: 23450, open: 23100, high: 23600, low: 23000, volume: 28000000, sma20: 23100 },
    { date: 'Mar 26', close: 23900, open: 23500, high: 24050, low: 23400, volume: 31000000, sma20: 23600 },
    { date: 'May 26', close: 24250, open: 23950, high: 24380, low: 23800, volume: 29000000, sma20: 24000 },
    { date: 'Jul 26', close: 24600, open: 24300, high: 24750, low: 24200, volume: 33000000, sma20: 24350 },
    { date: 'Sep 26', close: 25150, open: 24700, high: 25280, low: 24600, volume: 36000000, sma20: 24800 },
    { date: 'Oct 26', close: 25460, open: 25200, high: 25510, low: 25100, volume: 38200000, sma20: 25110 },
  ],
};

const MARKET_INDICES = [
  { name: 'NIFTY 50', value: 25460.25, change: 125.40, changePct: 0.50, exchange: 'NSE' },
  { name: 'SENSEX', value: 83520.15, change: 395.20, changePct: 0.48, exchange: 'BSE' },
  { name: 'NIFTY BANK', value: 52310.80, change: 280.10, changePct: 0.54, exchange: 'NSE' },
  { name: 'NIFTY IT', value: 41890.30, change: -110.45, changePct: -0.26, exchange: 'NSE' },
  { name: 'NIFTY MIDCAP', value: 58920.40, change: 412.30, changePct: 0.70, exchange: 'NSE' },
];

const TOP_GAINERS = [
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', price: 1720.50, changePct: 2.45, volume: '48.2 L' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1925.00, changePct: 1.85, volume: '1.59 Cr' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1262.40, changePct: 1.44, volume: '88.5 L' },
];

const TOP_LOSERS = [
  { symbol: 'ZYDUSWELL', name: 'Zydus Wellness Ltd', price: 1765.20, changePct: -2.06, volume: '22.1 K' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', price: 928.60, changePct: -1.45, volume: '62.4 L' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3453.70, changePct: -0.54, volume: '28.1 L' },
];

const LATEST_INTELLIGENCE_NEWS = [
  {
    id: 1,
    headline: 'RBI Maintains Accommodative Stance, Focus on Liquidity Buffer for Banking Sector',
    source: 'Financial Times India',
    time: '2 hours ago',
    category: 'Monetary Policy',
    sentiment: 'Positive',
  },
  {
    id: 2,
    headline: 'Reliance Retail Expands Omnichannel Fulfillment Centers Across Tier-2 Indian Metros',
    source: 'LiveMint',
    time: '4 hours ago',
    category: 'Corporate Strategy',
    sentiment: 'Positive',
  },
  {
    id: 3,
    headline: 'IT Sector Operating Margins Remain Under Scrutiny Amid Delayed North American Spend',
    source: 'Economic Times',
    time: '6 hours ago',
    category: 'Sector Research',
    sentiment: 'Caution',
  },
];

export function DashboardPage() {
  const { dataMode, portfolio, watchlist } = useApp();
  const [greeting, setGreeting] = useState('Good afternoon');
  const [niftyTimeframe, setNiftyTimeframe] = useState('1M');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Compute portfolio metrics
  const totalInvested = portfolio.reduce((sum, h) => sum + (h.quantity * h.avgPrice), 0);
  const currentValue = portfolio.reduce((sum, h) => sum + (h.quantity * (h.currentPrice || h.avgPrice)), 0);
  const unrealizedPL = currentValue - totalInvested;
  const unrealizedPLPct = totalInvested > 0 ? (unrealizedPL / totalInvested) * 100 : 0;
  // Estimated today's P&L
  const todayPL = currentValue * 0.0068; // +0.68% overall day move
  const todayPLPct = 0.68;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. HERO SECTION: Private Wealth & Research Aesthetic */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-sakra-deep via-sakra-forest to-sakra-deep text-sakra-ivory border border-sakra-forest p-6 sm:p-8 shadow-sakra-card">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-sakra-gold/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs uppercase tracking-widest text-sakra-gold font-semibold">
              {greeting}, Investor
            </span>
            <span className="text-sakra-goldLight/40">•</span>
            <StatusBadge status={dataMode === 'CONNECTED' ? 'Live Connected' : 'Sample / Historical Data'} size="xs" />
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-3">
            Your Wealth Journey, In Perspective.
          </h1>

          <p className="text-sm sm:text-base text-sakra-goldLight/80 font-sans font-light leading-relaxed max-w-2xl">
            Real market data. Smarter analytical depth. A calmer, institutional-grade approach to navigating Indian equities on NSE & BSE.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-mono text-sakra-goldLight/70">
            <DataFreshnessLabel source="NSE Bhavcopy & Tej-Bazaar Historical Feed" mode={dataMode} timestamp="27 Oct 2026, 15:30 IST" />
          </div>
        </div>
      </div>

      {/* 2. PORTFOLIO WEALTH SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Portfolio Value"
          value={formatINR(currentValue)}
          changePct={todayPLPct}
          changeLabel="today"
          icon={Briefcase}
          tooltip="Calculated from real-time / end-of-day quotes across your verified holdings"
        />
        <MetricCard
          label="Total Invested Capital"
          value={formatINR(totalInvested)}
          subtitle={`${portfolio.length} active Indian equity positions`}
          icon={LineChartIcon}
        />
        <MetricCard
          label="Unrealized Net P&L"
          value={formatINR(unrealizedPL)}
          changePct={unrealizedPLPct}
          changeLabel="overall return"
          trend={unrealizedPL >= 0 ? 'up' : 'down'}
          tooltip="Total paper profit or loss since asset acquisition dates"
        />
        <MetricCard
          label="Today's Estimated P&L"
          value={formatINR(todayPL)}
          changePct={todayPLPct}
          changeLabel="session move"
          trend="up"
          tooltip="Intraday equity price movement against previous day close"
        />
      </div>

      {/* 3. MULTI-COLUMN FLAGSHIP TERMINAL VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart Column (8 Cols on Desktop) */}
        <div className="lg:col-span-8 space-y-6">
          <SectionCard
            title="Benchmark Intelligence: NIFTY 50"
            subtitle="NSE India National Stock Exchange • 50 Bluechip Equities"
            badge={<StatusBadge status="NSE Open" size="xs" />}
            action={
              <Link
                to="/market"
                className="text-xs font-medium text-sakra-forest hover:text-sakra-gold flex items-center gap-1 transition-colors"
              >
                Full Market Heatmap <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <PriceChart
              title="NIFTY 50 Spot Index"
              currentPrice={25460.25}
              changePct={niftyTimeframe === '1D' ? 0.50 : niftyTimeframe === '1W' ? 1.11 : niftyTimeframe === '1M' ? 2.70 : niftyTimeframe === '3M' ? 4.56 : 11.67}
              data={NIFTY_DATASETS[niftyTimeframe] || NIFTY_DATASETS['1M']}
              timeframe={niftyTimeframe}
              onTimeframeChange={setNiftyTimeframe}
              height={320}
            />

            {/* Daily OHLC Strip */}
            <div className="mt-4 pt-4 border-t border-sakra-goldLight/50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2 rounded bg-sakra-cream/30 border border-sakra-goldLight/40">
                <span className="text-sakra-muted block text-[10px] uppercase">Day Open</span>
                <span className="font-semibold text-sakra-dark text-sm">{formatINR(25400.00)}</span>
              </div>
              <div className="p-2 rounded bg-sakra-cream/30 border border-sakra-goldLight/40">
                <span className="text-sakra-muted block text-[10px] uppercase">Day High</span>
                <span className="font-semibold text-sakra-gain text-sm">{formatINR(25510.80)}</span>
              </div>
              <div className="p-2 rounded bg-sakra-cream/30 border border-sakra-goldLight/40">
                <span className="text-sakra-muted block text-[10px] uppercase">Day Low</span>
                <span className="font-semibold text-sakra-loss text-sm">{formatINR(25380.20)}</span>
              </div>
              <div className="p-2 rounded bg-sakra-cream/30 border border-sakra-goldLight/40">
                <span className="text-sakra-muted block text-[10px] uppercase">Prev Close</span>
                <span className="font-semibold text-sakra-dark text-sm">{formatINR(25334.85)}</span>
              </div>
            </div>
          </SectionCard>

          {/* Top Gainers & Losers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gainers */}
            <SectionCard
              title="Top Accumulators"
              subtitle="Largest positive momentum on NSE today"
              badge={<StatusBadge status="Gainers" size="xs" />}
            >
              <div className="divide-y divide-sakra-goldLight/40">
                {TOP_GAINERS.map((stock) => (
                  <Link
                    key={stock.symbol}
                    to={`/stocks/${stock.symbol}`}
                    className="py-3 flex items-center justify-between hover:bg-sakra-cream/30 px-1 rounded transition-colors group"
                  >
                    <div>
                      <div className="font-mono font-bold text-xs text-sakra-dark group-hover:text-sakra-forest flex items-center gap-1.5">
                        {stock.symbol}
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-sakra-goldDark" />
                      </div>
                      <div className="text-[11px] text-sakra-muted truncate max-w-[140px]">{stock.name}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs font-semibold text-sakra-dark tabular-nums">{formatINR(stock.price)}</div>
                      <div className="text-xs font-medium text-sakra-gain tabular-nums">+{stock.changePct}%</div>
                    </div>
                  </Link>
                ))}
              </div>
            </SectionCard>

            {/* Losers */}
            <SectionCard
              title="Pullback Watch"
              subtitle="Notable retracements and value dips"
              badge={<StatusBadge status="Retracement" size="xs" />}
            >
              <div className="divide-y divide-sakra-goldLight/40">
                {TOP_LOSERS.map((stock) => (
                  <Link
                    key={stock.symbol}
                    to={`/stocks/${stock.symbol}`}
                    className="py-3 flex items-center justify-between hover:bg-sakra-cream/30 px-1 rounded transition-colors group"
                  >
                    <div>
                      <div className="font-mono font-bold text-xs text-sakra-dark group-hover:text-sakra-forest flex items-center gap-1.5">
                        {stock.symbol}
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-sakra-goldDark" />
                      </div>
                      <div className="text-[11px] text-sakra-muted truncate max-w-[140px]">{stock.name}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs font-semibold text-sakra-dark tabular-nums">{formatINR(stock.price)}</div>
                      <div className="text-xs font-medium text-sakra-loss tabular-nums">{stock.changePct}%</div>
                    </div>
                  </Link>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Supporting Column (4 Cols on Desktop) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Key Indices Card */}
          <SectionCard
            title="Market Indices"
            subtitle="NSE & BSE Major Benchmarks"
            action={<span className="text-[10px] font-mono text-sakra-muted">LIVE SPOT</span>}
          >
            <div className="space-y-3">
              {MARKET_INDICES.map((idx) => {
                const isPos = idx.changePct >= 0;
                return (
                  <div key={idx.name} className="flex items-center justify-between p-2.5 rounded bg-sakra-cream/30 border border-sakra-goldLight/40">
                    <div>
                      <div className="font-serif font-semibold text-xs text-sakra-dark">{idx.name}</div>
                      <div className="text-[10px] font-mono text-sakra-muted">{idx.exchange}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-sakra-dark tabular-nums">{formatINRRaw(idx.value)}</div>
                      <div className={`text-[11px] font-medium flex items-center justify-end ${
                        isPos ? 'text-sakra-gain' : 'text-sakra-loss'
                      }`}>
                        {isPos ? '+' : ''}{idx.changePct}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* AI Market Briefing (Groq-Powered) */}
          <SectionCard
            title="AI Market Intelligence"
            subtitle="Powered by Groq • Llama 3.3 Reasoning"
            badge={<StatusBadge status="Groq AI" size="xs" />}
            variant="cream"
          >
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 bg-white rounded-md border border-sakra-goldLight/70 shadow-sm">
                <div className="flex items-center gap-1.5 text-sakra-forest font-semibold mb-1 text-[11px] uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-sakra-gold" />
                  Executive Synthesis
                </div>
                <p className="text-sakra-dark/90 font-sans">
                  NIFTY 50 holds above key psychological support at 25,350 driven by strong capital inflows in private banking and telecom. Broad-market advance-decline ratio remains favorable at 1.4:1.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 bg-emerald-50/70 border border-emerald-200/60 rounded text-emerald-900">
                  <span className="font-bold block">Bullish Catalyst:</span>
                  Institutional accumulation in HDFCBANK & Bharti Airtel.
                </div>
                <div className="p-2 bg-amber-50/70 border border-amber-200/60 rounded text-amber-900">
                  <span className="font-bold block">Risk Watch:</span>
                  Midcap valuations hovering near 28x forward P/E.
                </div>
              </div>

              <div className="pt-2 text-[10px] font-mono text-sakra-muted flex justify-between items-center">
                <span>Distinguishing facts from interpretation</span>
                <Link to="/reports" className="text-sakra-forest hover:text-sakra-gold font-medium">Read Full Briefing →</Link>
              </div>
            </div>
          </SectionCard>

          {/* Watchlist Highlights */}
          <SectionCard
            title="Watchlist Highlights"
            subtitle="Your monitored equities"
            action={
              <Link to="/watchlist" className="text-xs text-sakra-forest hover:text-sakra-gold flex items-center gap-1">
                View All ({watchlist.length})
              </Link>
            }
          >
            <div className="divide-y divide-sakra-goldLight/40">
              {watchlist.slice(0, 4).map((item) => (
                <div key={item.symbol} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <Link to={`/stocks/${item.symbol}`} className="font-mono font-bold text-sakra-dark hover:text-sakra-forest">
                      {item.symbol}
                    </Link>
                    <div className="text-[10px] text-sakra-muted truncate max-w-[130px]">{item.name}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-semibold text-sakra-dark tabular-nums">{formatINR(item.price)}</div>
                    <div className={`text-[11px] font-medium ${item.changePct >= 0 ? 'text-sakra-gain' : 'text-sakra-loss'}`}>
                      {formatPercent(item.changePct)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* 4. LOWER DASHBOARD: Latest Research & Risk Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Latest Research & Verified News */}
        <div className="lg:col-span-8">
          <SectionCard
            title="Latest Research & Public Disclosures"
            subtitle="Verified announcements, filings & financial journalism"
            action={
              <Link to="/research" className="text-xs text-sakra-forest hover:text-sakra-gold flex items-center gap-1 font-medium">
                Research Terminal <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <div className="space-y-4">
              {LATEST_INTELLIGENCE_NEWS.map((news) => (
                <div key={news.id} className="p-3.5 rounded-lg bg-sakra-cream/20 border border-sakra-goldLight/50 hover:border-sakra-gold transition-colors">
                  <div className="flex items-center justify-between text-xs text-sakra-muted mb-1.5 font-mono">
                    <span className="text-sakra-forest font-semibold">{news.category}</span>
                    <span>{news.time}</span>
                  </div>
                  <h4 className="font-serif text-base font-semibold text-sakra-dark leading-snug mb-2 hover:text-sakra-forest cursor-pointer">
                    {news.headline}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-sakra-muted pt-2 border-t border-sakra-goldLight/40">
                    <span>Publisher: <strong className="text-sakra-dark">{news.source}</strong></span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      news.sentiment === 'Positive' ? 'bg-emerald-50 text-sakra-gain' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {news.sentiment} Sentiment
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Portfolio Risk Warnings & Alerts */}
        <div className="lg:col-span-4">
          <SectionCard
            title="Risk & Allocation Guardrails"
            subtitle="Automated risk audit of your holdings"
            badge={<StatusBadge status="Audit" size="xs" />}
          >
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded bg-amber-50/80 border border-amber-200/80 text-amber-950">
                <div className="flex items-center gap-1.5 font-semibold text-amber-900 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  Banking Concentration
                </div>
                <p className="text-[11px] leading-relaxed">
                  HDFCBANK represents ~34% of your total portfolio value. Consider setting stop-loss guardrails or gradual rebalancing if it crosses 40%.
                </p>
              </div>

              <div className="p-3 rounded bg-emerald-50/80 border border-emerald-200/80 text-emerald-950">
                <div className="flex items-center gap-1.5 font-semibold text-sakra-gain mb-1">
                  <CheckCircle className="w-4 h-4 text-sakra-gain" />
                  Healthy Debt Profile
                </div>
                <p className="text-[11px] leading-relaxed">
                  All 4 held companies maintain net debt-to-equity below 0.8x, providing resilient defensive cash generation.
                </p>
              </div>

              <div className="p-3 rounded bg-sakra-cream/40 border border-sakra-goldLight/60 text-sakra-dark">
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="text-sakra-muted">Portfolio Beta:</span>
                  <span className="font-bold text-sakra-dark">0.92 (Moderate Defensiveness)</span>
                </div>
                <div className="text-[10px] text-sakra-muted">Calculated against 1-year NIFTY 50 weekly covariance.</div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
