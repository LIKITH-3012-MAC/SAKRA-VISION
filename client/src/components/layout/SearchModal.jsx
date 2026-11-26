import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, TrendingDown, ArrowRight, Building2, Database } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/formatters';

const POPULAR_INDIAN_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', exchange: 'NSE', price: 1405.00, changePct: 0.38, sector: 'Energy & Retail' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', price: 3453.70, changePct: -0.54, sector: 'IT Services' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', exchange: 'NSE', price: 1925.00, changePct: 0.85, sector: 'Banking & Financials' },
  { symbol: 'INFY', name: 'Infosys Limited', exchange: 'NSE', price: 1500.10, changePct: 0.17, sector: 'IT Services' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', exchange: 'NSE', price: 1262.40, changePct: 0.94, sector: 'Banking & Financials' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', exchange: 'NSE', price: 1720.50, changePct: 1.42, sector: 'Telecommunications' },
  { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', price: 815.30, changePct: -0.22, sector: 'Public Sector Banking' },
  { symbol: 'ITC', name: 'ITC Limited', exchange: 'NSE', price: 472.80, changePct: 0.65, sector: 'FMCG & Hotels' },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd', exchange: 'NSE', price: 3580.00, changePct: 0.78, sector: 'Infrastructure & Defense' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', exchange: 'NSE', price: 928.60, changePct: -1.15, sector: 'Automotive & EV' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Ind', exchange: 'NSE', price: 1890.00, changePct: 0.45, sector: 'Healthcare & Pharma' },
  { symbol: 'ZYDUSWELL', name: 'Zydus Wellness Ltd', exchange: 'NSE', price: 1765.20, changePct: -2.06, sector: 'Consumer Wellness' },
];

export function SearchModal() {
  const { isSearchOpen, setIsSearchOpen } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [remoteResults, setRemoteResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Query backend endpoint on user search
  useEffect(() => {
    if (!query.trim()) {
      setRemoteResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/market/stocks?search=${encodeURIComponent(query.trim())}&limit=10`);
        if (res.ok) {
          const data = await res.json();
          if (data.stocks && Array.isArray(data.stocks)) {
            setRemoteResults(
              data.stocks.map((s) => ({
                symbol: s.symbol,
                name: s.name,
                exchange: s.series || 'NSE',
                price: s.latestClose || 0,
                changePct: 0,
                sector: s.isin ? `ISIN: ${s.isin}` : 'NSE Equity',
                isFromDb: true,
                latestDate: s.latestDate,
              }))
            );
          }
        }
      } catch (err) {
        // Quiet fallback to local list
      } finally {
        setIsSearching(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  // Combined stock list: remote results prioritized, merged with local matches
  const localFiltered = POPULAR_INDIAN_STOCKS.filter((stock) => {
    const q = query.toLowerCase().trim();
    return stock.symbol.toLowerCase().includes(q) || stock.name.toLowerCase().includes(q) || stock.sector.toLowerCase().includes(q);
  });

  const mergedMap = new Map();
  remoteResults.forEach(r => mergedMap.set(r.symbol, r));
  localFiltered.forEach(l => {
    if (!mergedMap.has(l.symbol)) mergedMap.set(l.symbol, l);
  });

  const displayedList = Array.from(mergedMap.values());

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setSelectedIndex(0);
      setRemoteResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const handleSelect = (symbol) => {
    setIsSearchOpen(false);
    navigate(`/stocks/${symbol}`);
  };

  const handleListKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (displayedList.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + displayedList.length) % (displayedList.length || 1));
    } else if (e.key === 'Enter' && displayedList[selectedIndex]) {
      e.preventDefault();
      handleSelect(displayedList[selectedIndex].symbol);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 bg-sakra-deep/70 backdrop-blur-sm flex items-start justify-center">
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-sakra-elevated border border-sakra-goldLight overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-sakra-goldLight/70 bg-sakra-cream/30">
          <Search className="w-5 h-5 text-sakra-goldDark mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleListKeyDown}
            placeholder="Search by symbol or name (e.g. INFY, Reliance, TCS)..."
            className="flex-1 bg-transparent border-0 text-sakra-dark placeholder-sakra-muted focus:outline-none text-sm font-sans"
          />
          {isSearching && (
            <span className="text-[10px] font-mono text-sakra-muted mr-2 animate-pulse">Searching EOD...</span>
          )}
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="p-1 rounded-md text-sakra-muted hover:text-sakra-dark hover:bg-sakra-cream"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-sakra-goldLight/30">
          {displayedList.length === 0 ? (
            <div className="p-8 text-center text-sakra-muted text-sm">
              No matching Indian equities found for "{query}".
            </div>
          ) : (
            displayedList.map((stock, idx) => {
              const isSelected = idx === selectedIndex;
              const isPositive = stock.changePct >= 0;

              return (
                <div
                  key={stock.symbol}
                  onClick={() => handleSelect(stock.symbol)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-sakra-cream/70 text-sakra-dark' : 'hover:bg-sakra-cream/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-sakra-forest/10 border border-sakra-forest/20 flex items-center justify-center font-mono font-bold text-xs text-sakra-forest">
                      {stock.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-sakra-dark">{stock.symbol}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sakra-cream text-sakra-muted border border-sakra-goldLight/60">
                          {stock.exchange}
                        </span>
                        {stock.isFromDb && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-50 text-sakra-forest border border-emerald-200">
                            EOD Dataset
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-sakra-muted flex items-center gap-2">
                        <span>{stock.name}</span>
                        <span>•</span>
                        <span className="text-[11px]">{stock.sector}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    {stock.price > 0 && (
                      <div>
                        <div className="font-mono font-semibold text-sm tabular-nums text-sakra-dark">
                          {formatINR(stock.price)}
                        </div>
                        {stock.latestDate ? (
                          <div className="text-[10px] font-mono text-sakra-muted">
                            {stock.latestDate} EOD
                          </div>
                        ) : (
                          <div className={`text-[11px] font-mono font-medium ${isPositive ? 'text-sakra-gain' : 'text-sakra-loss'}`}>
                            {isPositive ? '+' : ''}{stock.changePct}%
                          </div>
                        )}
                      </div>
                    )}
                    <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1 text-sakra-forest' : 'text-sakra-goldLight'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-sakra-cream/40 border-t border-sakra-goldLight/50 flex items-center justify-between text-[11px] font-mono text-sakra-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-sakra-gold" />
              <span>NSE / BSE Historical Bhavcopy (EOD)</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-white border border-sakra-goldLight text-[10px]">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white border border-sakra-goldLight text-[10px]">↵</kbd> Open Stock</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white border border-sakra-goldLight text-[10px]">esc</kbd> Dismiss</span>
          </div>
        </div>
      </div>
    </div>
  );
}
