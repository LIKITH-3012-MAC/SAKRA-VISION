import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export const DEFAULT_WATCHLIST = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', price: 1405.00, change: 5.30, changePct: 0.38, rsi: 54.2, exchange: 'NSE', notes: 'Energy transition and retail expansion' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3453.70, change: -18.80, changePct: -0.54, rsi: 48.6, exchange: 'NSE', notes: 'BFSI deals pipeline steady' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1925.00, change: 16.20, changePct: 0.85, rsi: 61.4, exchange: 'NSE', notes: 'Post-merger loan-deposit ratio normalizing' },
  { symbol: 'INFY', name: 'Infosys Limited', price: 1500.10, change: 2.60, changePct: 0.17, rsi: 52.1, exchange: 'NSE', notes: 'AI enterprise contracts growth' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1262.40, change: 11.80, changePct: 0.94, rsi: 65.8, exchange: 'NSE', notes: 'Strong RoA expansion above 2.2%' },
];

export const INITIAL_PORTFOLIO = [
  { id: 'h-1', symbol: 'HDFCBANK', exchange: 'NSE', name: 'HDFC Bank Ltd', quantity: 150, avgPrice: 1650.00, currentPrice: 1925.00, buyDate: '2024-03-15', sector: 'Financial Services', notes: 'Core banking allocation' },
  { id: 'h-2', symbol: 'RELIANCE', exchange: 'NSE', name: 'Reliance Industries Ltd', quantity: 120, avgPrice: 1280.00, currentPrice: 1405.00, buyDate: '2024-01-20', sector: 'Oil & Gas / Retail', notes: 'Long-term compounding' },
  { id: 'h-3', symbol: 'TCS', exchange: 'NSE', name: 'Tata Consultancy Services', quantity: 60, avgPrice: 3580.00, currentPrice: 3453.70, buyDate: '2024-06-10', sector: 'Information Technology', notes: 'Defensive cash-cow dividend play' },
  { id: 'h-4', symbol: 'INFY', exchange: 'NSE', name: 'Infosys Limited', quantity: 100, avgPrice: 1420.00, currentPrice: 1500.10, buyDate: '2024-08-05', sector: 'Information Technology', notes: 'Large cap tech recovery' },
];

export function AppProvider({ children }) {
  // Mode: 'DEMO' or 'CONNECTED'
  const [dataMode, setDataMode] = useState(() => {
    return localStorage.getItem('sakra_data_mode') || 'DEMO';
  });

  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('sakra_watchlist');
    return saved ? JSON.parse(saved) : DEFAULT_WATCHLIST;
  });

  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('sakra_portfolio');
    return saved ? JSON.parse(saved) : INITIAL_PORTFOLIO;
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [serverHealth, setServerHealth] = useState({ status: 'checking', groq: false, db: false, market: false });
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'RBI Policy Review Note', time: '10 mins ago', unread: true, category: 'Macro' },
    { id: 2, title: 'HDFCBANK Crossed 60-day EMA', time: '1 hour ago', unread: true, category: 'Technical' },
    { id: 3, title: 'Daily Market Intelligence Briefing Ready', time: 'Today 08:30 AM', unread: false, category: 'AI Intelligence' },
  ]);

  useEffect(() => {
    localStorage.setItem('sakra_data_mode', dataMode);
  }, [dataMode]);

  useEffect(() => {
    localStorage.setItem('sakra_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('sakra_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  // Check backend server status periodically
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/v1/health');
        if (res.ok) {
          const data = await res.json();
          setServerHealth({
            status: 'online',
            groq: data.services?.groq || false,
            db: data.services?.database || false,
            market: data.services?.market || false,
            version: data.version,
          });
        } else {
          setServerHealth({ status: 'offline', groq: false, db: false, market: false });
        }
      } catch {
        setServerHealth({ status: 'offline', groq: false, db: false, market: false });
      }
    }
    checkHealth();
    const timer = setInterval(checkHealth, 30000);
    return () => clearInterval(timer);
  }, []);

  const addToWatchlist = (stock) => {
    if (watchlist.some(w => w.symbol === stock.symbol)) return;
    setWatchlist(prev => [...prev, stock]);
    // Sync with backend API
    fetch('/api/watchlists/default/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol: stock.symbol, notes: stock.notes || '' }),
    }).catch(() => {});
  };

  const removeFromWatchlist = (symbol) => {
    setWatchlist(prev => prev.filter(w => w.symbol !== symbol));
    // Sync with backend API
    fetch(`/api/watchlists/default/items/${encodeURIComponent(symbol)}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  const addHolding = (newHolding) => {
    const item = {
      ...newHolding,
      id: 'h-' + Date.now(),
      currentPrice: newHolding.currentPrice || newHolding.avgPrice,
    };
    setPortfolio(prev => [...prev, item]);
  };

  const updateHolding = (id, updatedFields) => {
    setPortfolio(prev => prev.map(h => h.id === id ? { ...h, ...updatedFields } : h));
  };

  const deleteHolding = (id) => {
    setPortfolio(prev => prev.filter(h => h.id !== id));
  };

  return (
    <AppContext.Provider value={{
      dataMode,
      setDataMode,
      watchlist,
      addToWatchlist,
      removeFromWatchlist,
      portfolio,
      addHolding,
      updateHolding,
      deleteHolding,
      isSearchOpen,
      setIsSearchOpen,
      serverHealth,
      notifications,
      setNotifications,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
