import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { pool, isDbConnected } from '../config/db.js';
import { logger } from '../utils/logger.js';

/**
 * SAKRA VISION — Historical Market Data Ingestion Engine
 * Ingests official NSE & BSE Bhavcopy files (SEBI CMTS and Legacy Bhavcopy layouts).
 */

// Month abbreviation map for legacy NSE dates (e.g. "30-APR-2025" or "04-JAN-2010")
const MONTH_MAP = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

// In-memory catalog cache for resilient offline fallback mode
export const IN_MEMORY_EOD_STORE = new Map(); // key: `${symbol}:${date}:${series}`, val: record
export const IN_MEMORY_SYMBOLS = new Map();   // key: symbol, val: metadata

/**
 * Ensure the historical_eod_prices table exists in MySQL
 */
export async function ensureHistoricalTable() {
  if (!pool || !isDbConnected) return false;

  const createSql = `
    CREATE TABLE IF NOT EXISTS historical_eod_prices (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      trade_date DATE NOT NULL,
      symbol VARCHAR(30) NOT NULL,
      series VARCHAR(10) NOT NULL DEFAULT 'EQ',
      isin VARCHAR(20) DEFAULT NULL,
      company_name VARCHAR(255) DEFAULT NULL,
      open_price DECIMAL(14, 2) NOT NULL,
      high_price DECIMAL(14, 2) NOT NULL,
      low_price DECIMAL(14, 2) NOT NULL,
      close_price DECIMAL(14, 2) NOT NULL,
      last_price DECIMAL(14, 2) DEFAULT NULL,
      previous_close DECIMAL(14, 2) DEFAULT NULL,
      volume BIGINT NOT NULL DEFAULT 0,
      turnover DECIMAL(20, 2) DEFAULT 0.00,
      trade_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_symbol_date_series (symbol, trade_date, series),
      INDEX idx_symbol_trade_date (symbol, trade_date),
      INDEX idx_trade_date (trade_date),
      INDEX idx_isin (isin),
      INDEX idx_company_name (company_name)
    ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `;

  try {
    await pool.query(createSql);
    return true;
  } catch (err) {
    logger.warn('Could not auto-create historical_eod_prices table in MySQL:', { error: err.message });
    return false;
  }
}

/**
 * Safely parse date from multiple exchange layouts to standard ISO 'YYYY-MM-DD'
 */
export function parseTradeDate(rawDate) {
  if (!rawDate || typeof rawDate !== 'string') return null;
  const trimmed = rawDate.trim();

  // Format 1: ISO standard 'YYYY-MM-DD'
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-').map(Number);
    if (y >= 1990 && y <= 2040 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return trimmed;
    }
    return null;
  }

  // Format 2: Legacy NSE 'DD-MMM-YYYY' (e.g., '30-APR-2025' or '04-JAN-2010')
  const legacyMatch = trimmed.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (legacyMatch) {
    const day = legacyMatch[1].padStart(2, '0');
    const monthStr = legacyMatch[2].toLowerCase();
    const year = legacyMatch[3];
    const month = MONTH_MAP[monthStr];
    if (month && Number(year) >= 1990 && Number(year) <= 2040) {
      return `${year}-${month}-${day}`;
    }
  }

  // Format 3: Timestamp with time 'YYYY-MM-DD HH:mm:ss'
  if (trimmed.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }

  return null;
}

/**
 * Safely parse numeric float fields with commas or empty strings
 */
export function parsePrice(val, defaultVal = 0) {
  if (val === null || val === undefined || val === '') return defaultVal;
  if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
  const clean = String(val).replace(/,/g, '').trim();
  const num = parseFloat(clean);
  return isNaN(num) ? defaultVal : num;
}

/**
 * Safely parse integer fields
 */
export function parseInteger(val, defaultVal = 0) {
  if (val === null || val === undefined || val === '') return defaultVal;
  if (typeof val === 'number') return Math.floor(val);
  const clean = String(val).replace(/,/g, '').trim();
  const num = parseInt(clean, 10);
  return isNaN(num) ? defaultVal : num;
}

/**
 * Detect column mapping from CSV headers
 */
export function detectColumnMapping(headers) {
  const headerSet = new Set(headers.map(h => h.trim()));

  // Modern SEBI CMTS Bhavcopy (NSE & BSE post July 2024)
  if (headerSet.has('TckrSymb') || headerSet.has('ClsPric')) {
    return {
      type: 'SEBI_CMTS',
      symbol: 'TckrSymb',
      date: 'TradDt',
      series: 'SctySrs',
      isin: 'ISIN',
      name: 'FinInstrmNm',
      open: 'OpnPric',
      high: 'HghPric',
      low: 'LwPric',
      close: 'ClsPric',
      last: 'LastPric',
      prevClose: 'PrvsClsgPric',
      volume: 'TtlTradgVol',
      turnover: 'TtlTrfVal',
      trades: 'TtlNbOfTxsExctd',
    };
  }

  // Legacy NSE Bhavcopy layout
  if (headerSet.has('SYMBOL') && (headerSet.has('TIMESTAMP') || headerSet.has('CLOSE'))) {
    return {
      type: 'LEGACY_NSE',
      symbol: 'SYMBOL',
      date: 'TIMESTAMP',
      series: 'SERIES',
      isin: 'ISIN',
      name: null, // Legacy bhavcopy did not have company name column
      open: 'OPEN',
      high: 'HIGH',
      low: 'LOW',
      close: 'CLOSE',
      last: 'LAST',
      prevClose: 'PREVCLOSE',
      volume: 'TOTTRDQTY',
      turnover: 'TOTTRDVAL',
      trades: 'TOTALTRADES',
    };
  }

  // Standard Normalized format (e.g. from tejhq/indian-markets export)
  if (headerSet.has('symbol') && (headerSet.has('date') || headerSet.has('close'))) {
    return {
      type: 'NORMALIZED_TEJ',
      symbol: 'symbol',
      date: headerSet.has('trade_date') ? 'trade_date' : 'date',
      series: 'series',
      isin: 'isin',
      name: headerSet.has('company_name') ? 'company_name' : 'name',
      open: 'open',
      high: 'high',
      low: 'low',
      close: 'close',
      last: 'last',
      prevClose: 'prev_close',
      volume: 'volume',
      turnover: 'turnover',
      trades: 'trade_count',
    };
  }

  return null;
}

/**
 * Validate and normalize a single Bhavcopy record
 */
export function normalizeRecord(rawRow, mapping, rowIndex) {
  const rawSymbol = rawRow[mapping.symbol];
  if (!rawSymbol || !rawSymbol.trim()) {
    return { valid: false, reason: 'MISSING_SYMBOL', rowIndex };
  }

  const symbol = rawSymbol.trim().toUpperCase();

  const rawDate = rawRow[mapping.date];
  const tradeDate = parseTradeDate(rawDate);
  if (!tradeDate) {
    return { valid: false, reason: `INVALID_DATE: "${rawDate}"`, rowIndex, symbol };
  }

  const closePrice = parsePrice(rawRow[mapping.close], 0);
  if (closePrice <= 0) {
    return { valid: false, reason: `INVALID_CLOSE_PRICE: ${closePrice}`, rowIndex, symbol };
  }

  const openPrice = parsePrice(rawRow[mapping.open], closePrice);
  const highPrice = parsePrice(rawRow[mapping.high], Math.max(openPrice, closePrice));
  const lowPrice = parsePrice(rawRow[mapping.low], Math.min(openPrice, closePrice));
  const lastPrice = parsePrice(rawRow[mapping.last], closePrice);
  const prevClose = parsePrice(rawRow[mapping.prevClose], openPrice);
  const volume = parseInteger(rawRow[mapping.volume], 0);
  const turnover = parsePrice(rawRow[mapping.turnover], 0);
  const tradeCount = parseInteger(rawRow[mapping.trades], 0);

  const series = (rawRow[mapping.series] || 'EQ').trim().toUpperCase();
  const isin = mapping.isin && rawRow[mapping.isin] ? rawRow[mapping.isin].trim() : null;
  const companyName = mapping.name && rawRow[mapping.name] ? rawRow[mapping.name].trim() : `${symbol} Limited`;

  return {
    valid: true,
    record: {
      tradeDate,
      symbol,
      series,
      isin,
      companyName,
      openPrice,
      highPrice,
      lowPrice,
      closePrice,
      lastPrice,
      previousClose: prevClose,
      volume,
      turnover,
      tradeCount,
    },
  };
}

/**
 * Ingest a Bhavcopy CSV file streaming row-by-row in batches
 */
export async function ingestBhavcopyFile(filePath, options = {}) {
  const { batchSize = 500, maxRows = Infinity } = options;

  if (!fs.existsSync(filePath)) {
    throw new Error(`Bhavcopy source file not found at path: ${filePath}`);
  }

  const stats = fs.statSync(filePath);
  const startTime = Date.now();
  logger.info(`Starting streaming ingestion for: ${path.basename(filePath)} (${(stats.size / 1024).toFixed(1)} KB)`);

  await ensureHistoricalTable();

  const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineCount = 0;
  let headers = [];
  let mapping = null;
  const batch = [];
  const quarantinedRows = [];
  let insertedOrUpdated = 0;
  let validRecordsCount = 0;
  const symbolsSeen = new Set();
  let minDate = null;
  let maxDate = null;

  for await (const line of rl) {
    lineCount++;

    if (lineCount === 1) {
      headers = line.split(',').map(h => h.trim());
      mapping = detectColumnMapping(headers);
      if (!mapping) {
        throw new Error(`Unrecognized Bhavcopy CSV schema in file: ${filePath}. Headers: [${headers.slice(0, 10).join(', ')}]`);
      }
      logger.info(`Detected schema: ${mapping.type}`);
      continue;
    }

    if (!line.trim()) continue;
    if (lineCount > maxRows) break;

    const cols = line.split(',').map(c => c.trim());
    const rawRow = {};
    headers.forEach((h, idx) => {
      rawRow[h] = cols[idx] !== undefined ? cols[idx] : '';
    });

    const parsed = normalizeRecord(rawRow, mapping, lineCount);

    if (!parsed.valid) {
      quarantinedRows.push({
        row: lineCount,
        reason: parsed.reason,
        snippet: line.slice(0, 100),
      });
      continue;
    }

    const rec = parsed.record;
    validRecordsCount++;
    symbolsSeen.add(rec.symbol);

    if (!minDate || rec.tradeDate < minDate) minDate = rec.tradeDate;
    if (!maxDate || rec.tradeDate > maxDate) maxDate = rec.tradeDate;

    batch.push(rec);

    if (batch.length >= batchSize) {
      const count = await writeBatch(batch);
      insertedOrUpdated += count;
      batch.length = 0;
    }
  }

  if (batch.length > 0) {
    const count = await writeBatch(batch);
    insertedOrUpdated += count;
  }

  const durationMs = Date.now() - startTime;

  const summary = {
    filePath: path.resolve(filePath),
    fileName: path.basename(filePath),
    fileSizeBytes: stats.size,
    schemaDetected: mapping?.type || 'UNKNOWN',
    totalLinesProcessed: lineCount - 1, // minus header
    validRecords: validRecordsCount,
    insertedOrUpdated,
    quarantinedCount: quarantinedRows.length,
    quarantinedSample: quarantinedRows.slice(0, 5),
    uniqueSymbolsCount: symbolsSeen.size,
    symbols: Array.from(symbolsSeen).slice(0, 15),
    dateRange: { minDate, maxDate },
    durationMs,
    throughputRowsPerSec: Math.round(((lineCount - 1) / (durationMs || 1)) * 1000),
  };

  logger.info(`Ingestion complete for ${path.basename(filePath)}`, {
    valid: validRecordsCount,
    insertedOrUpdated,
    quarantined: quarantinedRows.length,
    durationMs,
  });

  return summary;
}

/**
 * Write a batch of normalized records to MySQL and update in-memory cache
 */
async function writeBatch(records) {
  if (records.length === 0) return 0;

  // 1. Always update in-memory store for instant fallback resilience
  for (const r of records) {
    const key = `${r.symbol}:${r.tradeDate}:${r.series}`;
    IN_MEMORY_EOD_STORE.set(key, r);

    IN_MEMORY_SYMBOLS.set(r.symbol, {
      symbol: r.symbol,
      name: r.companyName,
      isin: r.isin,
      series: r.series,
      latestClose: r.closePrice,
      latestDate: r.tradeDate,
    });
  }

  // 2. If MySQL database pool is initialized, execute batch INSERT with ON DUPLICATE KEY UPDATE
  if (pool) {
    try {
      const values = records.map(r => [
        r.tradeDate,
        r.symbol,
        r.series,
        r.isin,
        r.companyName,
        r.openPrice,
        r.highPrice,
        r.lowPrice,
        r.closePrice,
        r.lastPrice,
        r.previousClose,
        r.volume,
        r.turnover,
        r.tradeCount,
      ]);

      const sql = `
        INSERT INTO historical_eod_prices 
        (trade_date, symbol, series, isin, company_name, open_price, high_price, low_price, close_price, last_price, previous_close, volume, turnover, trade_count)
        VALUES ?
        ON DUPLICATE KEY UPDATE
          open_price = VALUES(open_price),
          high_price = VALUES(high_price),
          low_price = VALUES(low_price),
          close_price = VALUES(close_price),
          last_price = VALUES(last_price),
          previous_close = VALUES(previous_close),
          volume = VALUES(volume),
          turnover = VALUES(turnover),
          trade_count = VALUES(trade_count),
          isin = COALESCE(VALUES(isin), isin),
          company_name = COALESCE(VALUES(company_name), company_name);
      `;

      await pool.query(sql, [values]);
      return records.length;
    } catch (err) {
      logger.warn('Batch database write failed, stored in resilient in-memory cache:', {
        error: err.message,
        recordsCount: records.length,
      });
      return records.length;
    }
  }

  return records.length;
}

/**
 * Query historical EOD prices for a symbol with optional date filters
 */
export async function queryHistoricalPrices(symbol, options = {}) {
  const { from, to, limit = 100 } = options;
  const sym = String(symbol).trim().toUpperCase();

  // Try MySQL query first if connected
  if (pool) {
    try {
      let sql = `
        SELECT trade_date, symbol, series, isin, company_name,
               open_price, high_price, low_price, close_price, last_price, previous_close,
               volume, turnover, trade_count
        FROM historical_eod_prices
        WHERE symbol = ?
      `;
      const params = [sym];

      if (from) {
        sql += ' AND trade_date >= ?';
        params.push(from);
      }
      if (to) {
        sql += ' AND trade_date <= ?';
        params.push(to);
      }

      sql += ' ORDER BY trade_date ASC LIMIT ?';
      params.push(Number(limit));

      const [rows] = await pool.query(sql, params);

      if (rows && rows.length > 0) {
        return rows.map(r => ({
          tradeDate: r.trade_date instanceof Date ? r.trade_date.toISOString().slice(0, 10) : String(r.trade_date),
          symbol: r.symbol,
          series: r.series,
          isin: r.isin,
          companyName: r.company_name,
          open: Number(r.open_price),
          high: Number(r.high_price),
          low: Number(r.low_price),
          close: Number(r.close_price),
          last: Number(r.last_price || r.close_price),
          previousClose: Number(r.previous_close || r.open_price),
          volume: Number(r.volume),
          turnover: Number(r.turnover),
          trades: Number(r.trade_count),
        }));
      }
    } catch (err) {
      logger.warn('MySQL historical query failed, falling back to cache:', { error: err.message, symbol: sym });
    }
  }

  // Fallback to in-memory store
  const results = [];
  for (const [key, rec] of IN_MEMORY_EOD_STORE.entries()) {
    if (rec.symbol === sym) {
      if (from && rec.tradeDate < from) continue;
      if (to && rec.tradeDate > to) continue;
      results.push({
        tradeDate: rec.tradeDate,
        symbol: rec.symbol,
        series: rec.series,
        isin: rec.isin,
        companyName: rec.companyName,
        open: rec.openPrice,
        high: rec.highPrice,
        low: rec.lowPrice,
        close: rec.closePrice,
        last: rec.lastPrice,
        previousClose: rec.previousClose,
        volume: rec.volume,
        turnover: rec.turnover,
        trades: rec.tradeCount,
      });
    }
  }

  results.sort((a, b) => a.tradeDate.localeCompare(b.tradeDate));
  return results.slice(0, limit);
}

/**
 * Search available stock symbols from database and cache
 */
export async function searchStocks(queryStr, limit = 20) {
  const q = String(queryStr || '').trim().toLowerCase();
  const maxLimit = Math.min(Number(limit) || 20, 100);

  // Try MySQL if connected
  if (pool) {
    try {
      const sql = `
        SELECT DISTINCT symbol, isin, company_name, series,
               MAX(close_price) as latestClose,
               MAX(trade_date) as latestDate
        FROM historical_eod_prices
        WHERE LOWER(symbol) LIKE ? OR LOWER(company_name) LIKE ?
        GROUP BY symbol, isin, company_name, series
        ORDER BY symbol ASC
        LIMIT ?
      `;
      const pattern = `%${q}%`;
      const [rows] = await pool.query(sql, [pattern, pattern, maxLimit]);

      if (rows && rows.length > 0) {
        return rows.map(r => ({
          symbol: r.symbol,
          name: r.company_name || `${r.symbol} Limited`,
          isin: r.isin,
          series: r.series,
          latestClose: Number(r.latestClose),
          latestDate: r.latestDate instanceof Date ? r.latestDate.toISOString().slice(0, 10) : String(r.latestDate),
        }));
      }
    } catch (err) {
      logger.warn('MySQL stock search failed, falling back to cache:', { error: err.message });
    }
  }

  // Fallback to in-memory symbols
  const matches = [];
  for (const [sym, meta] of IN_MEMORY_SYMBOLS.entries()) {
    if (!q || sym.toLowerCase().includes(q) || (meta.name && meta.name.toLowerCase().includes(q))) {
      matches.push(meta);
      if (matches.length >= maxLimit) break;
    }
  }

  return matches;
}

/**
 * Get historical dataset coverage statistics
 */
export async function getMarketDatasetOverview() {
  let stats = {
    totalRecords: IN_MEMORY_EOD_STORE.size,
    symbolsCount: IN_MEMORY_SYMBOLS.size,
    earliestTradeDate: null,
    latestTradeDate: null,
    source: 'NSE & BSE Historical Bhavcopy (tejhq/indian-markets)',
    isLive: false,
    dataMode: 'HISTORICAL_EOD',
    lastIngestionTimestamp: new Date().toISOString(),
  };

  if (pool) {
    try {
      const sql = `
        SELECT COUNT(*) as total_records,
               COUNT(DISTINCT symbol) as unique_symbols,
               MIN(trade_date) as min_date,
               MAX(trade_date) as max_date
        FROM historical_eod_prices
      `;
      const [rows] = await pool.query(sql);
      if (rows && rows[0] && rows[0].total_records > 0) {
        stats.totalRecords = Number(rows[0].total_records);
        stats.symbolsCount = Number(rows[0].unique_symbols);
        stats.earliestTradeDate = rows[0].min_date instanceof Date ? rows[0].min_date.toISOString().slice(0, 10) : String(rows[0].min_date);
        stats.latestTradeDate = rows[0].max_date instanceof Date ? rows[0].max_date.toISOString().slice(0, 10) : String(rows[0].max_date);
        return stats;
      }
    } catch (err) {
      logger.warn('MySQL dataset stats query failed:', { error: err.message });
    }
  }

  // Fallback stats from memory store
  let minD = null;
  let maxD = null;
  for (const rec of IN_MEMORY_EOD_STORE.values()) {
    if (!minD || rec.tradeDate < minD) minD = rec.tradeDate;
    if (!maxD || rec.tradeDate > maxD) maxD = rec.tradeDate;
  }
  stats.earliestTradeDate = minD;
  stats.latestTradeDate = maxD;

  return stats;
}
