import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  BookmarkPlus,
  BookmarkCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Database,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge, DataFreshnessLabel } from '../components/ui/StatusBadge';
import { formatINR, formatCompactINR, formatPercent, formatVolume } from '../utils/formatters';
import { api } from '../api/client';

// Client-side baseline dataset for fallback
const FALLBACK_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Limited', series: 'EQ', isin: 'INE002A01018', price: 1405.00, previousClose: 1399.70, change: 5.30, changePct: 0.38, volume: 25480745, turnover: 35789000000, tradeDate: '2025-04-30' },
  { symbol: 'TCS', name: 'Tata Consultancy Services Limited', series: 'EQ', isin: 'INE467B01029', price: 3453.70, previousClose: 3472.50, change: -18.80, changePct: -0.54, volume: 2809332, turnover: 9700000000, tradeDate: '2025-04-30' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', series: 'EQ', isin: 'INE040A01034', price: 1925.00, previousClose: 1908.80, change: 16.20, changePct: 0.85, volume: 15968435, turnover: 30739000000, tradeDate: '2025-04-30' },
  { symbol: 'INFY', name: 'Infosys Limited', series: 'EQ', isin: 'INE009A01021', price: 1500.10, previousClose: 1497.50, change: 2.60, changePct: 0.17, volume: 7704183, turnover: 11550000000, tradeDate: '2025-04-30' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', series: 'EQ', isin: 'INE090A01021', price: 1262.40, previousClose: 1250.60, change: 11.80, changePct: 0.94, volume: 8854120, turnover: 11170000000, tradeDate: '2025-04-30' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', series: 'EQ', isin: 'INE397D01024', price: 1720.50, previousClose: 1696.40, change: 24.10, changePct: 1.42, volume: 4821900, turnover: 8290000000, tradeDate: '2025-04-30' },
  { symbol: 'SBIN', name: 'State Bank of India', series: 'EQ', isin: 'INE062A01020', price: 815.30, previousClose: 817.10, change: -1.80, changePct: -0.22, volume: 11200400, turnover: 9130000000, tradeDate: '2025-04-30' },
  { symbol: 'ITC', name: 'ITC Limited', series: 'EQ', isin: 'INE154A01025', price: 472.80, previousClose: 469.70, change: 3.10, changePct: 0.65, volume: 6420000, turnover: 3030000000, tradeDate: '2025-04-30' },
  { symbol: 'LT', name: 'Larsen & Toubro Limited', series: 'EQ', isin: 'INE018A01030', price: 3580.00, previousClose: 3552.30, change: 27.70, changePct: 0.78, volume: 1845000, turnover: 6605000000, tradeDate: '2025-04-30' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Limited', series: 'EQ', isin: 'INE155A01022', price: 928.60, previousClose: 939.40, change: -10.80, changePct: -1.15, volume: 6240000, turnover: 5790000000, tradeDate: '2025-04-30' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Limited', series: 'EQ', isin: 'INE044A01036', price: 1890.00, previousClose: 1881.50, change: 8.50, changePct: 0.45, volume: 1920000, turnover: 3628000000, tradeDate: '2025-04-30' },
  { symbol: 'ZYDUSWELL', name: 'Zydus Wellness Limited', series: 'EQ', isin: 'INE768C01010', price: 1765.20, previousClose: 1802.40, change: -37.20, changePct: -2.06, volume: 22144, turnover: 39100000, tradeDate: '2025-04-30' },
];

export function StockScreenerPage() {
  const { dataMode, watchlist, addToWatchlist, removeFromWatchlist } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter state
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minChangePct, setMinChangePct] = useState('');
  const [maxChangePct, setMaxChangePct] = useState('');
  const [minVolume, setMinVolume] = useState('');

  // Sorting state
  const [sortBy, setSortBy] = useState('volume');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 15;

  // API response state
  const [screenerResult, setScreenerResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch screener records from backend
  useEffect(() => {
    let cancelled = false;

    async function fetchScreener() {
      setIsLoading(true);
      setError(null);
      try {
        const params = {
          search: debouncedSearch.trim(),
          sortBy,
          sortOrder,
          page,
          limit,
        };
        if (minPrice !== '' && !isNaN(minPrice)) params.minPrice = Number(minPrice);
        if (maxPrice !== '' && !isNaN(maxPrice)) params.maxPrice = Number(maxPrice);
        if (minChangePct !== '' && !isNaN(minChangePct)) params.minChangePct = Number(minChangePct);
        if (maxChangePct !== '' && !isNaN(maxChangePct)) params.maxChangePct = Number(maxChangePct);
        if (minVolume !== '' && !isNaN(minVolume)) params.minVolume = Number(minVolume);

        const data = await api.getScreener(params);
        if (!cancelled) {
          if (data && data.status === 'success') {
            setScreenerResult(data);
            setUsingFallback(false);
          } else {
            setError(data?.message || 'Failed to fetch screener results.');
            setUsingFallback(true);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Error connecting to screener API.');
          setUsingFallback(true);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchScreener();
    return () => { cancelled = true; };
  }, [debouncedSearch, minPrice, maxPrice, minChangePct, maxChangePct, minVolume, sortBy, sortOrder, page]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setMinPrice('');
    setMaxPrice('');
    setMinChangePct('');
    setMaxChangePct('');
    setMinVolume('');
    setSortBy('volume');
    setSortOrder('desc');
    setPage(1);
  };

  // Determine current display list and pagination
  const stocks = useMemo(() => {
    if (screenerResult && screenerResult.data && !usingFallback) {
      return screenerResult.data;
    }
    // Client fallback filter logic
    let res = [...FALLBACK_STOCKS];
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      res = res.filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }
    if (minPrice !== '' && !isNaN(minPrice)) res = res.filter(s => s.price >= Number(minPrice));
    if (maxPrice !== '' && !isNaN(maxPrice)) res = res.filter(s => s.price <= Number(maxPrice));
    if (minChangePct !== '' && !isNaN(minChangePct)) res = res.filter(s => s.changePct >= Number(minChangePct));
    if (maxChangePct !== '' && !isNaN(maxChangePct)) res = res.filter(s => s.changePct <= Number(maxChangePct));
    if (minVolume !== '' && !isNaN(minVolume)) res = res.filter(s => s.volume >= Number(minVolume));

    res.sort((a, b) => {
      let aVal = a[sortBy] ?? 0;
      let bVal = b[sortBy] ?? 0;
      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return res.slice((page - 1) * limit, page * limit);
  }, [screenerResult, usingFallback, debouncedSearch, minPrice, maxPrice, minChangePct, maxChangePct, minVolume, sortBy, sortOrder, page]);

  const pagination = useMemo(() => {
    if (screenerResult && screenerResult.pagination && !usingFallback) {
      return screenerResult.pagination;
    }
    const total = FALLBACK_STOCKS.length;
    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasMore: page < Math.ceil(total / limit),
    };
  }, [screenerResult, usingFallback, page]);

  const latestTradeDate = screenerResult?.data?.[0]?.tradeDate || '2025-04-30';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sakra-goldLight/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase tracking-wider text-sakra-gold font-semibold">
              Screening Engine
            </span>
            <span className="text-sakra-goldLight">•</span>
            <span className="text-xs text-sakra-muted">Multi-Factor Equities Screen</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-sakra-dark tracking-tight">
            NSE Stock Screener
          </h1>
          <p className="text-xs sm:text-sm text-sakra-muted mt-1 max-w-2xl">
            Screen Indian equities using price action, volume liquidity, and daily percentage change derived from verified historical EOD Bhavcopy records.
          </p>
        </div>

        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-sakra-goldLight hover:border-sakra-gold text-xs text-sakra-muted hover:text-sakra-dark transition-colors font-mono self-start sm:self-auto shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Filters
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <DataFreshnessLabel
          source={screenerResult?.source || "NSE Bhavcopy EOD Pipeline (tejhq/indian-markets)"}
          mode={screenerResult ? "CONNECTED" : dataMode}
          timestamp={`${latestTradeDate} EOD Close`}
        />
        <div className="flex items-center gap-2 text-sakra-muted text-[11px]">
          <Database className="w-3.5 h-3.5 text-sakra-gold" />
          <span>Active Ingestion: <strong>{pagination.total}</strong> Historical Equities</span>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-sakra-goldLight shadow-sakra-subtle space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search symbol/name (4 cols) */}
          <div className="relative lg:col-span-4">
            <Search className="w-4 h-4 text-sakra-muted absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search symbol or enterprise name..."
              className="w-full pl-9 pr-3 py-1.5 bg-sakra-cream/40 border border-sakra-goldLight rounded text-xs text-sakra-dark placeholder-sakra-muted focus:outline-none focus:border-sakra-gold font-mono"
            />
          </div>

          {/* Price Range Filter (3 cols) */}
          <div className="lg:col-span-3 flex items-center gap-2">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
              placeholder="Min Price ₹"
              className="w-1/2 px-2.5 py-1.5 bg-sakra-cream/40 border border-sakra-goldLight rounded text-xs text-sakra-dark placeholder-sakra-muted focus:outline-none focus:border-sakra-gold font-mono"
            />
            <span className="text-sakra-muted text-xs font-mono">–</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
              placeholder="Max Price ₹"
              className="w-1/2 px-2.5 py-1.5 bg-sakra-cream/40 border border-sakra-goldLight rounded text-xs text-sakra-dark placeholder-sakra-muted focus:outline-none focus:border-sakra-gold font-mono"
            />
          </div>

          {/* Change % Range Filter (3 cols) */}
          <div className="lg:col-span-3 flex items-center gap-2">
            <input
              type="number"
              step="0.5"
              value={minChangePct}
              onChange={(e) => { setMinChangePct(e.target.value); setPage(1); }}
              placeholder="Min % Change"
              className="w-1/2 px-2.5 py-1.5 bg-sakra-cream/40 border border-sakra-goldLight rounded text-xs text-sakra-dark placeholder-sakra-muted focus:outline-none focus:border-sakra-gold font-mono"
            />
            <span className="text-sakra-muted text-xs font-mono">–</span>
            <input
              type="number"
              step="0.5"
              value={maxChangePct}
              onChange={(e) => { setMaxChangePct(e.target.value); setPage(1); }}
              placeholder="Max % Change"
              className="w-1/2 px-2.5 py-1.5 bg-sakra-cream/40 border border-sakra-goldLight rounded text-xs text-sakra-dark placeholder-sakra-muted focus:outline-none focus:border-sakra-gold font-mono"
            />
          </div>

          {/* Min Volume Filter (2 cols) */}
          <div className="lg:col-span-2">
            <select
              value={minVolume}
              onChange={(e) => { setMinVolume(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 bg-sakra-cream/40 border border-sakra-goldLight rounded text-xs text-sakra-dark focus:outline-none focus:border-sakra-gold font-mono"
            >
              <option value="">Min Vol: All</option>
              <option value="50000">&gt; 50K shares</option>
              <option value="100000">&gt; 100K shares</option>
              <option value="1000000">&gt; 1M shares</option>
              <option value="5000000">&gt; 5M shares</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Active Info */}
        <div className="flex flex-wrap items-center justify-between text-xs text-sakra-muted pt-2 border-t border-sakra-goldLight/40 font-mono gap-2">
          <div className="flex items-center gap-2">
            <span>Found <strong className="text-sakra-dark">{pagination.total}</strong> matching securities</span>
            {isLoading && (
              <span className="inline-flex items-center gap-1 text-sakra-forest text-[11px]">
                <Loader2 className="w-3 h-3 animate-spin text-sakra-gold" />
                Querying historical records...
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Sorted by: <strong className="text-sakra-forest capitalize">{sortBy}</strong> ({sortOrder.toUpperCase()})</span>
            <span>•</span>
            <span>Click column headers to re-sort</span>
          </div>
        </div>
      </div>

      {/* Error Notice if API encountered issues */}
      {error && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error} — displaying cached verified historical dataset.</span>
          </div>
          <button
            type="button"
            onClick={() => setPage(p => p)}
            className="text-amber-700 underline hover:text-amber-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Screener Results Table */}
      <div className="bg-white rounded-xl border border-sakra-goldLight shadow-sakra-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-sakra-cream/70 border-b border-sakra-goldLight font-mono uppercase tracking-wider text-[11px] text-sakra-muted">
                <th className="py-3.5 px-4 w-12 text-center">Watch</th>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:text-sakra-dark select-none"
                  onClick={() => handleSort('symbol')}
                >
                  <div className="flex items-center gap-1">
                    Symbol {sortBy === 'symbol' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-sakra-gold" /> : <ArrowDown className="w-3 h-3 text-sakra-gold" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                  </div>
                </th>
                <th className="py-3.5 px-4">Series / ISIN</th>
                <th
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-sakra-dark select-none"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Close Price {sortBy === 'price' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-sakra-gold" /> : <ArrowDown className="w-3 h-3 text-sakra-gold" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                  </div>
                </th>
                <th
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-sakra-dark select-none"
                  onClick={() => handleSort('changePct')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Day Change {sortBy === 'changePct' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-sakra-gold" /> : <ArrowDown className="w-3 h-3 text-sakra-gold" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                  </div>
                </th>
                <th
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-sakra-dark select-none"
                  onClick={() => handleSort('volume')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Volume {sortBy === 'volume' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-sakra-gold" /> : <ArrowDown className="w-3 h-3 text-sakra-gold" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                  </div>
                </th>
                <th
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-sakra-dark select-none"
                  onClick={() => handleSort('turnover')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Turnover {sortBy === 'turnover' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-sakra-gold" /> : <ArrowDown className="w-3 h-3 text-sakra-gold" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Trade Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sakra-goldLight/40">
              {isLoading && stocks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs font-mono text-sakra-muted">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-sakra-gold mb-2" />
                    Executing screener query across historical trading sessions...
                  </td>
                </tr>
              ) : stocks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs font-mono text-sakra-muted">
                    <Filter className="w-6 h-6 mx-auto text-sakra-goldLight mb-2" />
                    No securities match the selected filter criteria.
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="text-sakra-forest font-semibold underline hover:text-sakra-dark"
                      >
                        Clear filters and view all
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                stocks.map((stock) => {
                  const inWatchlist = watchlist.some(w => w.symbol === stock.symbol);
                  const isPos = (stock.changePct ?? 0) >= 0;

                  return (
                    <tr key={stock.symbol} className="hover:bg-sakra-cream/40 transition-colors">
                      {/* Watchlist toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => inWatchlist ? removeFromWatchlist(stock.symbol) : addToWatchlist(stock)}
                          className={`p-1 rounded hover:bg-sakra-cream ${inWatchlist ? 'text-sakra-gold' : 'text-sakra-muted hover:text-sakra-dark'}`}
                          title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        >
                          {inWatchlist ? <BookmarkCheck className="w-4 h-4 fill-sakra-gold/20" /> : <BookmarkPlus className="w-4 h-4" />}
                        </button>
                      </td>

                      {/* Symbol & Name */}
                      <td className="py-3.5 px-4">
                        <Link to={`/stocks/${stock.symbol}`} className="font-mono font-bold text-sakra-dark hover:text-sakra-forest text-sm">
                          {stock.symbol}
                        </Link>
                        <div className="text-[11px] text-sakra-muted truncate max-w-[200px]">
                          {stock.name || stock.companyName}
                        </div>
                      </td>

                      {/* Series & ISIN */}
                      <td className="py-3.5 px-4 text-sakra-muted font-mono text-[11px]">
                        <div><strong className="text-sakra-dark">{stock.series || 'EQ'}</strong></div>
                        <div className="text-[10px] opacity-75">{stock.isin || '—'}</div>
                      </td>

                      {/* Close Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-sakra-dark tabular-nums text-sm">
                        {formatINR(stock.price)}
                      </td>

                      {/* Change % */}
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-semibold ${
                          isPos ? 'text-sakra-gain bg-emerald-50' : 'text-sakra-loss bg-rose-50'
                        }`}>
                          {formatPercent(stock.changePct)}
                        </span>
                        {stock.change !== undefined && (
                          <div className="text-[10px] text-sakra-muted mt-0.5">
                            {isPos ? '+' : ''}{Number(stock.change).toFixed(2)}
                          </div>
                        )}
                      </td>

                      {/* Volume */}
                      <td className="py-3.5 px-4 text-right font-mono text-sakra-muted tabular-nums">
                        <span className="font-medium text-sakra-dark">{formatVolume(stock.volume)}</span>
                        <div className="text-[10px] text-sakra-muted">shares</div>
                      </td>

                      {/* Turnover */}
                      <td className="py-3.5 px-4 text-right font-mono text-sakra-muted tabular-nums">
                        {stock.turnover ? formatCompactINR(stock.turnover) : '—'}
                      </td>

                      {/* Trade Date */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sakra-cream text-sakra-forest border border-sakra-goldLight">
                          {stock.tradeDate ? `${stock.tradeDate} EOD` : 'EOD'}
                        </span>
                      </td>

                      {/* Detail link */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/stocks/${stock.symbol}`}
                          className="inline-flex items-center gap-1 text-sakra-forest hover:text-sakra-gold font-semibold font-mono text-xs transition-colors"
                        >
                          Analyze ↗
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-sakra-cream/40 border-t border-sakra-goldLight/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="text-sakra-muted">
            Showing <strong className="text-sakra-dark">{pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}</strong> to{' '}
            <strong className="text-sakra-dark">{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> of{' '}
            <strong className="text-sakra-dark">{pagination.total}</strong> historical securities
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1 || isLoading}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-white border border-sakra-goldLight hover:border-sakra-gold disabled:opacity-40 disabled:cursor-not-allowed text-sakra-dark transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>

            <span className="px-3 py-1.5 rounded bg-white border border-sakra-goldLight text-sakra-forest font-semibold">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages || isLoading}
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-white border border-sakra-goldLight hover:border-sakra-gold disabled:opacity-40 disabled:cursor-not-allowed text-sakra-dark transition-colors"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
