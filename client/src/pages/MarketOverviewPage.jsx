import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Filter,
  Activity,
  Layers,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MetricCard } from '../components/ui/MetricCard';
import { SectionCard } from '../components/ui/SectionCard';
import { StatusBadge, DataFreshnessLabel } from '../components/ui/StatusBadge';
import { formatINR, formatINRRaw, formatPercent, formatVolume } from '../utils/formatters';

const INDICES_DATA = [
  { name: 'NIFTY 50', exchange: 'NSE', value: 25460.25, change: 125.40, changePct: 0.50, high: 25510.80, low: 25380.20, pe: 22.8, pb: 4.1 },
  { name: 'SENSEX', exchange: 'BSE', value: 83520.15, change: 395.20, changePct: 0.48, high: 83690.40, low: 83250.00, pe: 24.1, pb: 4.3 },
  { name: 'NIFTY BANK', exchange: 'NSE', value: 52310.80, change: 280.10, changePct: 0.54, high: 52450.00, low: 52100.00, pe: 16.4, pb: 2.2 },
  { name: 'NIFTY IT', exchange: 'NSE', value: 41890.30, change: -110.45, changePct: -0.26, high: 42150.00, low: 41720.00, pe: 29.5, pb: 8.4 },
  { name: 'NIFTY MIDCAP 100', exchange: 'NSE', value: 58920.40, change: 412.30, changePct: 0.70, high: 59050.00, low: 58600.00, pe: 31.2, pb: 4.8 },
  { name: 'NIFTY SMALLCAP 100', exchange: 'NSE', value: 18450.60, change: 155.80, changePct: 0.85, high: 18510.00, low: 18320.00, pe: 27.8, pb: 3.9 },
];

const SECTORS_PERFORMANCE = [
  { name: 'Telecommunications', changePct: 1.84, leader: 'BHARTIARTL', pe: 38.4 },
  { name: 'Banking & Financials', changePct: 0.72, leader: 'HDFCBANK', pe: 16.5 },
  { name: 'Energy & Oil/Gas', changePct: 0.45, leader: 'RELIANCE', pe: 25.2 },
  { name: 'Automotive', changePct: -0.38, leader: 'M&M', pe: 28.1 },
  { name: 'Information Technology', changePct: -0.42, leader: 'INFY', pe: 27.6 },
  { name: 'Pharmaceuticals', changePct: 0.28, leader: 'SUNPHARMA', pe: 34.0 },
  { name: 'FMCG & Consumer', changePct: 0.15, leader: 'ITC', pe: 26.5 },
  { name: 'Metals & Mining', changePct: -0.65, leader: 'TATASTEEL', pe: 18.2 },
];

const MOST_ACTIVE_VOLUME = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 1405.00, changePct: 0.38, volume: 25480745, turnoverCr: 3579.72 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1925.00, changePct: 0.85, volume: 15968435, turnoverCr: 3073.95 },
  { symbol: 'INFY', name: 'Infosys Limited', price: 1500.10, changePct: 0.17, volume: 7704183, turnoverCr: 1155.57 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3453.70, changePct: -0.54, volume: 2809332, turnoverCr: 973.16 },
  { symbol: 'ZYDUSWELL', name: 'Zydus Wellness', price: 1765.20, changePct: -2.06, volume: 22144, turnoverCr: 3.95 },
];

export function MarketOverviewPage() {
  const { dataMode } = useApp();
  const [selectedExchange, setSelectedExchange] = useState('ALL');
  const [turnoverSort, setTurnoverSort] = useState('turnoverCr');
  const [turnoverDir, setTurnoverDir] = useState('desc');
  const [datasetOverview, setDatasetOverview] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/market/overview')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!cancelled && d && d.status === 'success') {
          setDatasetOverview(d);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const filteredIndices = selectedExchange === 'ALL'
    ? INDICES_DATA
    : INDICES_DATA.filter((i) => i.exchange === selectedExchange);

  const sortedMovers = [...MOST_ACTIVE_VOLUME].sort((a, b) => {
    let aVal = a[turnoverSort];
    let bVal = b[turnoverSort];
    if (typeof aVal === 'string') {
      return turnoverDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return turnoverDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const handleTurnoverSort = (field) => {
    if (turnoverSort === field) {
      setTurnoverDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setTurnoverSort(field);
      setTurnoverDir('desc');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sakra-goldLight/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase tracking-wider text-sakra-gold font-semibold">
              Market Intelligence
            </span>
            <span className="text-sakra-goldLight">•</span>
            <span className="text-xs text-sakra-muted">NSE & BSE Equities</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-sakra-dark tracking-tight">
            Indian Equity Market Overview
          </h1>
          <p className="text-xs sm:text-sm text-sakra-muted mt-1 max-w-2xl">
            Macroeconomic indices, market breadth indicators, volume leaders, and sector capital flows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Exchange Filter Toggle */}
          <div className="flex items-center bg-white p-1 rounded-lg border border-sakra-goldLight text-xs font-mono shadow-sm">
            {['ALL', 'NSE', 'BSE'].map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setSelectedExchange(ex)}
                className={`px-3 py-1 rounded transition-all font-medium ${
                  selectedExchange === ex
                    ? 'bg-sakra-forest text-sakra-gold font-semibold shadow-inner'
                    : 'text-sakra-muted hover:text-sakra-dark'
                }`}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      <DataFreshnessLabel
        source={datasetOverview?.source || "NSE Bhavcopy (CM Segment) & Official Index Feeds"}
        mode={datasetOverview ? "CONNECTED" : dataMode}
        timestamp={datasetOverview?.dataset?.latestTradeDate ? `${datasetOverview.dataset.latestTradeDate} EOD Close` : "27 Oct 2026, 15:30 IST"}
      />

      {/* Market Breadth & Macro Sentiment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SectionCard
          title="Market Breadth (NSE 500)"
          subtitle="Advances vs Declines"
          badge={<StatusBadge status="Positive" size="xs" />}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-sakra-gain font-semibold">Advances: 294 (58.8%)</span>
              <span className="text-sakra-loss font-semibold">Declines: 192 (38.4%)</span>
            </div>

            {/* Breadth Bar */}
            <div className="h-3 rounded-full overflow-hidden flex bg-sakra-cream border border-sakra-goldLight">
              <div style={{ width: '58.8%' }} className="bg-sakra-gain h-full" title="Advances" />
              <div style={{ width: '2.8%' }} className="bg-stone-300 h-full" title="Unchanged: 14" />
              <div style={{ width: '38.4%' }} className="bg-sakra-loss h-full" title="Declines" />
            </div>

            <div className="flex justify-between text-[11px] text-sakra-muted font-mono">
              <span>Unchanged: 14</span>
              <span>A/D Ratio: <strong>1.53</strong></span>
            </div>
          </div>
        </SectionCard>

        <MetricCard
          label="Total NSE Turnover"
          value="₹84,210 Cr"
          changePct={4.2}
          changeLabel="vs 10D avg"
          subtitle="CM Normal Market Session"
          icon={Activity}
        />

        <MetricCard
          label="India VIX (Volatility)"
          value="12.85"
          changePct={-3.4}
          changeLabel="vs prev close"
          trend="up"
          subtitle="Low Volatility Regime (< 15.0)"
          tooltip="Implied market volatility from NIFTY index options"
        />
      </div>

      {/* Major Indices Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-semibold text-sakra-dark">Key Benchmark & Sectoral Indices</h2>
          <span className="text-xs font-mono text-sakra-muted">Official Exchange Metrics</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIndices.map((idx) => {
            const isPos = idx.changePct >= 0;
            return (
              <div
                key={idx.name}
                className="bg-white rounded-lg border border-sakra-goldLight/80 p-5 shadow-sakra-subtle hover:border-sakra-gold hover:shadow-sakra-card transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif font-bold text-base text-sakra-dark">{idx.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sakra-cream text-sakra-muted border border-sakra-goldLight">
                    {idx.exchange}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-serif text-2xl font-bold text-sakra-dark tabular-nums tracking-tight">
                    {formatINRRaw(idx.value)}
                  </span>
                  <span className={`text-xs font-mono font-medium ${isPos ? 'text-sakra-gain' : 'text-sakra-loss'}`}>
                    {isPos ? '+' : ''}{idx.change.toFixed(2)} ({isPos ? '+' : ''}{idx.changePct}%)
                  </span>
                </div>

                <div className="pt-3 border-t border-sakra-goldLight/40 grid grid-cols-2 gap-2 text-[11px] font-mono text-sakra-muted">
                  <div>
                    <span>Day High: </span>
                    <strong className="text-sakra-dark font-medium">{formatINRRaw(idx.high)}</strong>
                  </div>
                  <div>
                    <span>Day Low: </span>
                    <strong className="text-sakra-dark font-medium">{formatINRRaw(idx.low)}</strong>
                  </div>
                  <div>
                    <span>Trailing P/E: </span>
                    <strong className="text-sakra-dark font-medium">{idx.pe}x</strong>
                  </div>
                  <div>
                    <span>P/B Ratio: </span>
                    <strong className="text-sakra-dark font-medium">{idx.pb}x</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sector Performance & Volume Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sector Heatmap Performance */}
        <div className="lg:col-span-6">
          <SectionCard
            title="Sector Performance"
            subtitle="Today's weighted sector price movement"
          >
            <div className="space-y-3">
              {SECTORS_PERFORMANCE.map((sec) => {
                const isPos = sec.changePct >= 0;
                return (
                  <div key={sec.name} className="flex items-center justify-between p-2.5 rounded bg-sakra-cream/25 border border-sakra-goldLight/40 hover:bg-sakra-cream/50 transition-colors">
                    <div>
                      <div className="font-sans font-semibold text-xs text-sakra-dark">{sec.name}</div>
                      <div className="text-[10px] font-mono text-sakra-muted">
                        P/E: {sec.pe}x • Top: <strong className="text-sakra-forest">{sec.leader}</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <div className={`w-20 text-right font-medium text-xs ${isPos ? 'text-sakra-gain' : 'text-sakra-loss'}`}>
                        {isPos ? '+' : ''}{sec.changePct.toFixed(2)}%
                      </div>
                      <div className="w-16 h-2 rounded bg-sakra-cream overflow-hidden">
                        <div
                          className={`h-full ${isPos ? 'bg-sakra-gain' : 'bg-sakra-loss'}`}
                          style={{ width: `${Math.min(100, Math.abs(sec.changePct) * 40)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>

        {/* Volume & Turnover Leaders from Bhavcopy */}
        <div className="lg:col-span-6">
          <SectionCard
            title="Turnover Leaders (NSE CM)"
            subtitle="Equities driving the highest value exchange"
            action={<span className="text-[10px] font-mono text-sakra-muted">Sortable Bhavcopy</span>}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-sakra-goldLight/50 text-[10px] font-mono uppercase text-sakra-muted">
              <button
                type="button"
                onClick={() => handleTurnoverSort('symbol')}
                className="hover:text-sakra-dark font-semibold"
              >
                Symbol {turnoverSort === 'symbol' && (turnoverDir === 'asc' ? '↑' : '↓')}
              </button>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleTurnoverSort('price')}
                  className="hover:text-sakra-dark font-semibold"
                >
                  Price {turnoverSort === 'price' && (turnoverDir === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  type="button"
                  onClick={() => handleTurnoverSort('changePct')}
                  className="hover:text-sakra-dark font-semibold"
                >
                  Change {turnoverSort === 'changePct' && (turnoverDir === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  type="button"
                  onClick={() => handleTurnoverSort('turnoverCr')}
                  className="hover:text-sakra-dark font-semibold"
                >
                  Turnover {turnoverSort === 'turnoverCr' && (turnoverDir === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>

            <div className="divide-y divide-sakra-goldLight/40">
              {sortedMovers.map((stock) => (
                <div key={stock.symbol} className="py-3 flex items-center justify-between text-xs hover:bg-sakra-cream/30 px-1 rounded transition-colors">
                  <div>
                    <Link to={`/stocks/${stock.symbol}`} className="font-mono font-bold text-sakra-dark hover:text-sakra-forest flex items-center gap-1.5">
                      {stock.symbol}
                      <ArrowRight className="w-3 h-3 text-sakra-goldDark" />
                    </Link>
                    <div className="text-[11px] text-sakra-muted">{stock.name}</div>
                  </div>

                  <div className="text-right font-mono flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-sakra-dark tabular-nums">{formatINR(stock.price)}</div>
                      <div className={`text-[11px] font-medium ${stock.changePct >= 0 ? 'text-sakra-gain' : 'text-sakra-loss'}`}>
                        {stock.changePct >= 0 ? '+' : ''}{stock.changePct}%
                      </div>
                    </div>
                    <div className="text-right min-w-[75px]">
                      <div className="font-bold text-sakra-forest tabular-nums">₹{stock.turnoverCr.toLocaleString('en-IN')} Cr</div>
                      <div className="text-[10px] text-sakra-muted">Volume</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
