/**
 * SAKRA VISION — API Client
 */

const BASE_URL = '/api/v1';

async function fetchAPI(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[SAKRA API] Call to ${endpoint} failed:`, err.message);
    throw err;
  }
}

export const api = {
  // Historical Market Data (tejhq/indian-markets EOD)
  getHistoricalStocks: (search = '', limit = 20) =>
    fetch(`/api/market/stocks?search=${encodeURIComponent(search)}&limit=${limit}`).then(r => r.json()),
  getStockHistory: (symbol, from = '', to = '', limit = 100) => {
    let url = `/api/market/stocks/${encodeURIComponent(symbol)}/history?limit=${limit}`;
    if (from) url += `&from=${encodeURIComponent(from)}`;
    if (to) url += `&to=${encodeURIComponent(to)}`;
    return fetch(url).then(r => r.json());
  },
  getStockAnalytics: (symbol, from = '', to = '') => {
    let url = `/api/market/stocks/${encodeURIComponent(symbol)}/analytics`;
    const q = new URLSearchParams();
    if (from) q.append('from', from);
    if (to) q.append('to', to);
    const qs = q.toString();
    if (qs) url += `?${qs}`;
    return fetch(url).then(r => r.json());
  },
  getHistoricalOverview: () => fetch('/api/market/overview').then(r => r.json()),
  getScreener: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        q.append(k, v);
      }
    });
    return fetch(`/api/screener?${q.toString()}`).then(r => r.json());
  },
  getMoversEOD: (type = '', limit = 5) => {
    let url = `/api/market/movers?limit=${limit}`;
    if (type) url += `&type=${encodeURIComponent(type)}`;
    return fetch(url).then(r => r.json());
  },
  getIndicesEOD: () => fetch('/api/market/indices').then(r => r.json()),

  // Market
  getMarketOverview: () => fetchAPI('/market/overview'),
  getMarketIndices: () => fetchAPI('/market/indices'),
  getMarketMovers: () => fetchAPI('/market/movers'),

  // Stocks
  getStocks: (params = '') => fetchAPI(`/stocks${params ? '?' + params : ''}`),
  getStockDetail: (symbol) => fetchAPI(`/stocks/${symbol}`),
  getStockCandles: (symbol, timeframe = '1M') => fetchAPI(`/stocks/${symbol}/candles?timeframe=${timeframe}`),
  getStockAnalysis: (symbol) => fetchAPI(`/stocks/${symbol}/analysis`),

  // Research & Groq AI
  getResearchHealth: () => fetch('/api/research/health').then(r => r.json()),
  researchCompany: (symbol, task = 'comprehensive', question = '') =>
    fetch('/api/research/company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, task, question }),
    }).then(r => r.json()),
  researchNews: (query, symbol = null, limit = 5) =>
    fetch('/api/research/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, symbol, limit }),
    }).then(r => r.json()),
  researchAnalyze: (question, symbol = null, task = 'comprehensive') =>
    fetch('/api/research/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, symbol, task }),
    }).then(r => r.json()),
  getAIMarketBriefing: () => fetchAPI('/research/briefing'),
  searchResearch: (query) => fetchAPI('/research/search', {
    method: 'POST',
    body: JSON.stringify({ query }),
  }),
  getCompanyResearch: (symbol) => fetchAPI('/research/company', {
    method: 'POST',
    body: JSON.stringify({ symbol }),
  }),

  // Predictions & Strategy Lab (Statistical Baselines & Leakage-Safe Backtesting)
  getPredictionModels: () => fetch('/api/predictions/models').then(r => r.json()),
  getStockPrediction: (symbol, horizon = 5, model = 'trend') =>
    fetch(`/api/predictions/${encodeURIComponent(symbol)}?horizon=${horizon}&model=${encodeURIComponent(model)}`).then(r => r.json()),
  runBacktest: (symbol, horizon = 5, model = 'trend', minTrainWindow = 5) =>
    fetch('/api/backtests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, horizon, model, minTrainWindow }),
    }).then(r => r.json()),
  getBacktestById: (id) => fetch(`/api/backtests/${encodeURIComponent(id)}`).then(r => r.json()),
  getRecentBacktests: () => fetch('/api/backtests').then(r => r.json()),
  getPrediction: (symbol, horizon = 5) => fetch(`/api/predictions/${symbol}?horizon=${horizon}`).then(r => r.json()),
  getBacktests: () => fetch('/api/backtests').then(r => r.json()),

  // Portfolio Management (Phase 6)
  getPortfolio: (id = 'default') => fetch(`/api/portfolio/${encodeURIComponent(id)}`).then(r => r.json()),
  listPortfolios: () => fetch('/api/portfolio/list').then(r => r.json()),
  createPortfolio: (data) =>
    fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  addPortfolioHolding: (portfolioId, holdingData) =>
    fetch(`/api/portfolio/${encodeURIComponent(portfolioId)}/holdings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(holdingData),
    }).then(r => r.json()),
  updatePortfolioHolding: (portfolioId, holdingId, updateData) =>
    fetch(`/api/portfolio/${encodeURIComponent(portfolioId)}/holdings/${encodeURIComponent(holdingId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    }).then(r => r.json()),
  deletePortfolioHolding: (portfolioId, holdingId) =>
    fetch(`/api/portfolio/${encodeURIComponent(portfolioId)}/holdings/${encodeURIComponent(holdingId)}`, {
      method: 'DELETE',
    }).then(r => r.json()),

  // Watchlists (Phase 6)
  getWatchlists: () => fetch('/api/watchlists').then(r => r.json()),
  getWatchlist: (id = 'default') => fetch(`/api/watchlists/${encodeURIComponent(id)}`).then(r => r.json()),
  createWatchlist: (data) =>
    fetch('/api/watchlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  addWatchlistItem: (watchlistId, itemData) =>
    fetch(`/api/watchlists/${encodeURIComponent(watchlistId)}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    }).then(r => r.json()),
  removeWatchlistItem: (watchlistId, itemId) =>
    fetch(`/api/watchlists/${encodeURIComponent(watchlistId)}/items/${encodeURIComponent(itemId)}`, {
      method: 'DELETE',
    }).then(r => r.json()),

  // Reports
  getDailyReport: () => fetchAPI('/reports/daily'),

  // System
  getHealth: () => fetchAPI('/health'),
  getStatus: () => fetchAPI('/status'),
};
