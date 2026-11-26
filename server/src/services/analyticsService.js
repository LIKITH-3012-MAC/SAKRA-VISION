/**
 * SAKRA VISION — Market Analytics & Quantitative Indicator Engine
 * Calculates metrics and technical indicators from official stored historical EOD data.
 * 
 * METHODOLOGY & FORMULAS:
 * 1. Price Change:
 *    - Absolute Change = Latest Close - Previous Trading Day Close
 *    - Percentage Change = ((Latest Close - Previous Close) / Previous Close) * 100
 * 2. Period Return:
 *    - Return % = ((Last Close in Period - First Close in Period) / First Close in Period) * 100
 * 3. Simple Moving Average (SMA):
 *    - SMA_k = (1/k) * sum_{i=1}^k (Close_{N-i+1})
 *    - Requires at least k observations. If N < k, returns null with reason.
 * 4. Annualized Historical Volatility:
 *    - Daily logarithmic return: u_t = ln(Close_t / Close_{t-1})
 *    - Sample standard deviation s = sqrt( (1 / (M - 1)) * sum_{t=1}^M (u_t - u_mean)^2 ) where M = N - 1
 *    - Annualized Volatility = s * sqrt(252) * 100 (assuming standard 252 Indian market trading days)
 *    - Requires at least 5 trading sessions (M >= 4). If N < 5, returns null.
 * 
 * IMPORTANT:
 * - Only actual exchange trading sessions are analyzed; calendar days without trading are not treated as trading days.
 * - Missing data is never silently substituted with zeros.
 * - Historical metrics are descriptive and do NOT guarantee future price behavior.
 */

import { queryHistoricalPrices, IN_MEMORY_EOD_STORE, IN_MEMORY_SYMBOLS } from './historicalDataService.js';
import { pool } from '../config/db.js';
import { logger } from '../utils/logger.js';

/**
 * Calculate arithmetic mean
 */
export function mean(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return sum / numbers.length;
}

/**
 * Calculate sample standard deviation
 */
export function sampleStdDev(numbers) {
  if (!numbers || numbers.length < 2) return 0;
  const avg = mean(numbers);
  const sumSquaredDiffs = numbers.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0);
  return Math.sqrt(sumSquaredDiffs / (numbers.length - 1));
}

/**
 * Calculate Simple Moving Average for a window length k
 * Requires at least k observations. Returns null if observations < k.
 */
export function calculateSMA(closes, k) {
  if (!closes || closes.length < k || k <= 0) return null;
  const windowSlice = closes.slice(closes.length - k);
  const sum = windowSlice.reduce((acc, val) => acc + val, 0);
  return Number((sum / k).toFixed(2));
}

/**
 * Calculate annualized historical volatility from closing prices
 * Formula: Sample standard deviation of daily log returns * sqrt(252) * 100
 * Requires at least 5 trading sessions.
 */
export function calculateAnnualizedVolatility(closes) {
  if (!closes || closes.length < 5) return null;

  const logReturns = [];
  for (let i = 1; i < closes.length; i++) {
    const prev = closes[i - 1];
    const curr = closes[i];
    if (prev <= 0 || curr <= 0) continue;
    logReturns.push(Math.log(curr / prev));
  }

  if (logReturns.length < 4) return null;

  const stdDev = sampleStdDev(logReturns);
  const annualized = stdDev * Math.sqrt(252) * 100;
  return Number(annualized.toFixed(2));
}

/**
 * Calculate comprehensive analytics for a stock symbol over an optional date range
 */
export async function calculateStockAnalytics(symbol, options = {}) {
  const { from, to } = options;
  const sym = String(symbol).trim().toUpperCase();

  // Query chronological records
  const records = await queryHistoricalPrices(sym, { from, to, limit: 1000 });

  if (!records || records.length === 0) {
    return {
      symbol: sym,
      hasData: false,
      message: `No historical trading records found for symbol ${sym}.`,
      metrics: null,
    };
  }

  // Ensure strict chronological ordering
  records.sort((a, b) => a.tradeDate.localeCompare(b.tradeDate));

  const count = records.length;
  const closes = records.map(r => r.close);
  const volumes = records.map(r => r.volume);
  const turnovers = records.map(r => r.turnover);

  const latestRecord = records[count - 1];
  const firstRecord = records[0];

  const latestClose = latestRecord.close;
  const latestTradeDate = latestRecord.tradeDate;

  // Previous available trading-day close
  let previousClose = latestRecord.previousClose;
  if (count >= 2) {
    previousClose = records[count - 2].close;
  }

  // Price change calculations
  const priceChange = Number((latestClose - previousClose).toFixed(2));
  const changePct = previousClose > 0
    ? Number((((latestClose - previousClose) / previousClose) * 100).toFixed(2))
    : 0;

  // Period extremes
  const periodHigh = Math.max(...closes);
  const periodLow = Math.min(...closes);

  // Period return %
  const firstClose = firstRecord.close;
  const periodReturnPct = firstClose > 0
    ? Number((((latestClose - firstClose) / firstClose) * 100).toFixed(2))
    : 0;

  // Volume & turnover averages
  const averageVolume = Math.round(mean(volumes));
  const averageTurnover = Number(mean(turnovers).toFixed(2));

  // Simple Moving Averages
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);

  // Daily returns array
  const dailyReturns = [];
  for (let i = 1; i < count; i++) {
    const prev = closes[i - 1];
    const curr = closes[i];
    const pct = prev > 0 ? Number((((curr - prev) / prev) * 100).toFixed(2)) : 0;
    dailyReturns.push({
      date: records[i].tradeDate,
      close: curr,
      changePct: pct,
    });
  }

  // Annualized historical volatility
  const annualizedVolatilityPct = calculateAnnualizedVolatility(closes);

  return {
    symbol: sym,
    companyName: latestRecord.companyName || `${sym} Limited`,
    isin: latestRecord.isin,
    series: latestRecord.series,
    hasData: true,
    dateRange: {
      from: firstRecord.tradeDate,
      to: latestTradeDate,
    },
    tradingDaysCount: count,
    metrics: {
      latestClose,
      previousClose,
      priceChange,
      changePct,
      periodHigh,
      periodLow,
      periodReturnPct,
      averageVolume,
      averageTurnover,
      sma20,
      sma50,
      annualizedVolatilityPct,
      latestTradeDate,
      tradingDaysCount: count,
    },
    observationsNotes: {
      sma20Available: sma20 !== null,
      sma50Available: sma50 !== null,
      volatilityAvailable: annualizedVolatilityPct !== null,
      notes: [
        count < 20 ? `SMA 20 requires at least 20 trading sessions (available: ${count}).` : 'SMA 20 calculated.',
        count < 50 ? `SMA 50 requires at least 50 trading sessions (available: ${count}).` : 'SMA 50 calculated.',
        count < 5 ? `Volatility requires at least 5 trading sessions (available: ${count}).` : 'Annualized volatility calculated using 252 trading days.',
      ],
    },
    formulaDocumentation: {
      priceChange: 'latestClose - previousTradingDayClose',
      changePct: '((latestClose - previousClose) / previousClose) * 100',
      periodReturn: '((lastCloseInPeriod - firstCloseInPeriod) / firstCloseInPeriod) * 100',
      volatility: 'SampleStdDev(DailyLogReturns) * sqrt(252) * 100',
      sma20: 'ArithmeticMean(Close of last 20 trading sessions)',
      sma50: 'ArithmeticMean(Close of last 50 trading sessions)',
    },
    recentDailyReturns: dailyReturns.slice(-10),
  };
}

/**
 * Query stock screener results with filtering, sorting, and pagination
 */
export async function runStockScreener(filters = {}) {
  const {
    search = '',
    minPrice,
    maxPrice,
    minChangePct,
    maxChangePct,
    minVolume,
    sortBy = 'volume',
    sortOrder = 'desc',
    page = 1,
    limit = 20,
  } = filters;

  const validSortColumns = ['price', 'changePct', 'volume', 'symbol', 'name', 'turnover', 'tradeDate'];
  const sanitizedSortBy = validSortColumns.includes(sortBy) ? sortBy : 'volume';
  const sanitizedSortOrder = String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';

  const sanitizedPage = Math.max(1, Number(page) || 1);
  const sanitizedLimit = Math.min(100, Math.max(1, Number(limit) || 20));

  // Collect universe of stocks from historical records
  // We compute the latest summary for each symbol
  const stockSummaries = [];

  // 1. Group records by symbol
  const symbolMap = new Map();

  for (const rec of IN_MEMORY_EOD_STORE.values()) {
    if (!symbolMap.has(rec.symbol)) {
      symbolMap.set(rec.symbol, []);
    }
    symbolMap.get(rec.symbol).push(rec);
  }

  // If in-memory store has items, compute analytics per symbol
  for (const [sym, records] of symbolMap.entries()) {
    records.sort((a, b) => a.tradeDate.localeCompare(b.tradeDate));
    const count = records.length;
    const latest = records[count - 1];
    const prev = count >= 2 ? records[count - 2] : null;

    const previousClose = prev ? prev.closePrice : (latest.previousClose || latest.openPrice);
    const priceChange = Number((latest.closePrice - previousClose).toFixed(2));
    const changePct = previousClose > 0
      ? Number((((latest.closePrice - previousClose) / previousClose) * 100).toFixed(2))
      : 0;

    const closes = records.map(r => r.closePrice);
    const volumes = records.map(r => r.volume);

    stockSummaries.push({
      symbol: sym,
      name: latest.companyName || `${sym} Limited`,
      series: latest.series,
      isin: latest.isin,
      price: latest.closePrice,
      previousClose,
      priceChange,
      changePct,
      volume: latest.volume,
      turnover: latest.turnover,
      tradeDate: latest.tradeDate,
      averageVolume: Math.round(mean(volumes)),
      sma20: calculateSMA(closes, 20),
      sma50: calculateSMA(closes, 50),
      annualizedVolatility: calculateAnnualizedVolatility(closes),
      tradingDaysCount: count,
    });
  }

  // Apply filters
  let filtered = stockSummaries;

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(s =>
      s.symbol.toLowerCase().includes(q) ||
      (s.name && s.name.toLowerCase().includes(q))
    );
  }

  if (minPrice !== undefined && !isNaN(minPrice)) {
    filtered = filtered.filter(s => s.price >= Number(minPrice));
  }
  if (maxPrice !== undefined && !isNaN(maxPrice)) {
    filtered = filtered.filter(s => s.price <= Number(maxPrice));
  }

  if (minChangePct !== undefined && !isNaN(minChangePct)) {
    filtered = filtered.filter(s => s.changePct >= Number(minChangePct));
  }
  if (maxChangePct !== undefined && !isNaN(maxChangePct)) {
    filtered = filtered.filter(s => s.changePct <= Number(maxChangePct));
  }

  if (minVolume !== undefined && !isNaN(minVolume)) {
    filtered = filtered.filter(s => s.volume >= Number(minVolume));
  }

  // Sorting
  filtered.sort((a, b) => {
    let aVal = a[sanitizedSortBy];
    let bVal = b[sanitizedSortBy];

    if (sanitizedSortBy === 'price') {
      aVal = a.price;
      bVal = b.price;
    } else if (sanitizedSortBy === 'changePct') {
      aVal = a.changePct;
      bVal = b.changePct;
    } else if (sanitizedSortBy === 'volume') {
      aVal = a.volume;
      bVal = b.volume;
    }

    if (typeof aVal === 'string') {
      return sanitizedSortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sanitizedSortOrder === 'asc' ? (aVal || 0) - (bVal || 0) : (bVal || 0) - (aVal || 0);
  });

  const totalRecords = filtered.length;
  const totalPages = Math.ceil(totalRecords / sanitizedLimit) || 1;
  const offset = (sanitizedPage - 1) * sanitizedLimit;
  const paginatedData = filtered.slice(offset, offset + sanitizedLimit);

  return {
    data: paginatedData,
    pagination: {
      page: sanitizedPage,
      limit: sanitizedLimit,
      totalRecords,
      totalPages,
      hasNextPage: sanitizedPage < totalPages,
      hasPrevPage: sanitizedPage > 1,
    },
    appliedFilters: {
      search: search || null,
      minPrice: minPrice !== undefined ? Number(minPrice) : null,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : null,
      minChangePct: minChangePct !== undefined ? Number(minChangePct) : null,
      maxChangePct: maxChangePct !== undefined ? Number(maxChangePct) : null,
      minVolume: minVolume !== undefined ? Number(minVolume) : null,
      sortBy: sanitizedSortBy,
      sortOrder: sanitizedSortOrder,
    },
  };
}

/**
 * Derive market top movers (gainers and losers) from historical EOD records
 */
export async function getMarketMovers(options = {}) {
  const { type, limit = 5 } = options;
  const maxLimit = Math.min(Number(limit) || 5, 20);

  // Compute screener summaries
  const screenerResult = await runStockScreener({ limit: 1000, sortBy: 'changePct', sortOrder: 'desc' });
  const allStocks = screenerResult.data;

  const gainers = allStocks
    .filter(s => s.changePct > 0)
    .sort((a, b) => b.changePct - a.changePct)
    .slice(0, maxLimit);

  const losers = allStocks
    .filter(s => s.changePct < 0)
    .sort((a, b) => a.changePct - b.changePct)
    .slice(0, maxLimit);

  if (type === 'gainers') {
    return { gainers, count: gainers.length };
  }
  if (type === 'losers') {
    return { losers, count: losers.length };
  }

  return {
    gainers,
    losers,
    gainersCount: gainers.length,
    losersCount: losers.length,
  };
}
