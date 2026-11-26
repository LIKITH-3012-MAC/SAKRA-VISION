import crypto from 'crypto';
import { pool, isDbConnected } from '../config/db.js';
import { queryHistoricalPrices } from './historicalDataService.js';
import { logger } from '../utils/logger.js';

// In-memory persistent store for resilient local/offline operation
export const IN_MEMORY_PORTFOLIOS = new Map();
export const IN_MEMORY_HOLDINGS = new Map(); // key: holdingId, value: holdingRecord

// Initialize default portfolio and sample holdings
const DEFAULT_PORTFOLIO_ID = 'port-default';
IN_MEMORY_PORTFOLIOS.set(DEFAULT_PORTFOLIO_ID, {
  id: DEFAULT_PORTFOLIO_ID,
  user_id: null, // Single-tenant local development mode (no fake user IDs)
  name: 'Primary Wealth Portfolio',
  description: 'Flagship long-term capital compounding portfolio',
  currency: 'INR',
  created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  updated_at: new Date().toISOString(),
});

// Seed default holdings in memory
const DEFAULT_HOLDINGS_SEED = [
  { id: 'h-rel-1', portfolio_id: DEFAULT_PORTFOLIO_ID, symbol: 'RELIANCE', exchange: 'NSE', quantity: 120, average_buy_price: 2820.00, notes: 'Energy & retail conglomerate' },
  { id: 'h-hdfc-2', portfolio_id: DEFAULT_PORTFOLIO_ID, symbol: 'HDFCBANK', exchange: 'NSE', quantity: 150, average_buy_price: 1650.00, notes: 'Private banking core' },
  { id: 'h-tcs-3', portfolio_id: DEFAULT_PORTFOLIO_ID, symbol: 'TCS', exchange: 'NSE', quantity: 60, average_buy_price: 3580.00, notes: 'Defensive cash-cow dividend play' },
  { id: 'h-infy-4', portfolio_id: DEFAULT_PORTFOLIO_ID, symbol: 'INFY', exchange: 'NSE', quantity: 100, average_buy_price: 1420.00, notes: 'Enterprise digital engineering' },
];

for (const h of DEFAULT_HOLDINGS_SEED) {
  IN_MEMORY_HOLDINGS.set(h.id, {
    ...h,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

/**
 * Ensure database tables exist in MySQL if pool is active
 */
export async function ensurePortfolioTables() {
  if (!pool || !isDbConnected) return false;

  const createPortfoliosSql = `
    CREATE TABLE IF NOT EXISTS portfolios (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NULL,
      name VARCHAR(100) NOT NULL DEFAULT 'Primary Wealth Portfolio',
      description VARCHAR(255) DEFAULT NULL,
      currency VARCHAR(5) NOT NULL DEFAULT 'INR',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_portfolios_user_id (user_id)
    ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `;

  const createHoldingsSql = `
    CREATE TABLE IF NOT EXISTS portfolio_holdings (
      id VARCHAR(36) PRIMARY KEY,
      portfolio_id VARCHAR(36) NOT NULL,
      symbol VARCHAR(30) NOT NULL,
      exchange VARCHAR(10) NOT NULL DEFAULT 'NSE',
      quantity DECIMAL(14, 4) NOT NULL,
      average_buy_price DECIMAL(14, 2) NOT NULL,
      notes TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_portfolio_symbol (portfolio_id, symbol),
      INDEX idx_holdings_portfolio_id (portfolio_id),
      INDEX idx_holdings_symbol (symbol),
      CONSTRAINT fk_holdings_portfolio
        FOREIGN KEY (portfolio_id) REFERENCES portfolios (id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `;

  try {
    await pool.query(createPortfoliosSql);
    await pool.query(createHoldingsSql);
    return true;
  } catch (err) {
    logger.warn('[PortfolioService] Could not ensure portfolio tables in MySQL:', { error: err.message });
    return false;
  }
}

/**
 * Calculate valuation metrics for an individual holding
 * Formula:
 * - investedAmount = quantity * averageBuyPrice
 * - marketValue = quantity * valuationPrice (if verified EOD close available)
 * - unrealizedPL = marketValue - investedAmount
 * - unrealizedPLPct = (unrealizedPL / investedAmount) * 100
 */
export function calculateHoldingValuation(holding, marketRecord = null) {
  const qty = Number(holding.quantity);
  const avgPrice = Number(holding.average_buy_price || holding.avgPrice || 0);

  if (isNaN(qty) || qty <= 0 || isNaN(avgPrice) || avgPrice <= 0) {
    throw new Error(`Invalid holding parameters: quantity (${qty}) and average_buy_price (${avgPrice}) must be positive numbers.`);
  }

  const investedAmount = Number((qty * avgPrice).toFixed(2));

  if (marketRecord && typeof marketRecord.close === 'number' && marketRecord.close > 0) {
    const valuationPrice = Number(marketRecord.close.toFixed(2));
    const marketValue = Number((qty * valuationPrice).toFixed(2));
    const unrealizedPL = Number((marketValue - investedAmount).toFixed(2));
    const unrealizedPLPct = investedAmount > 0 ? Number(((unrealizedPL / investedAmount) * 100).toFixed(2)) : 0;

    const previousClose = typeof marketRecord.previousClose === 'number' ? marketRecord.previousClose : valuationPrice;
    const dayChange = Number((valuationPrice - previousClose).toFixed(2));
    const dayChangePct = previousClose > 0 ? Number(((dayChange / previousClose) * 100).toFixed(2)) : 0;

    return {
      id: holding.id,
      portfolioId: holding.portfolio_id || holding.portfolioId,
      symbol: holding.symbol.toUpperCase(),
      exchange: holding.exchange || 'NSE',
      companyName: marketRecord.companyName || `${holding.symbol} Limited`,
      quantity: qty,
      averageBuyPrice: avgPrice,
      investedAmount,
      valuationPrice,
      valuationDate: marketRecord.tradeDate || null,
      marketValue,
      unrealizedPL,
      unrealizedPLPct,
      dayChange,
      dayChangePct,
      isValuationAvailable: true,
      priceStatus: 'VERIFIED_HISTORICAL_EOD',
      notes: holding.notes || '',
      updatedAt: holding.updated_at || holding.updatedAt || new Date().toISOString(),
    };
  }

  // Unavailable market price fallback: Do not fabricate current price or silently substitute 0
  return {
    id: holding.id,
    portfolioId: holding.portfolio_id || holding.portfolioId,
    symbol: holding.symbol.toUpperCase(),
    exchange: holding.exchange || 'NSE',
    companyName: `${holding.symbol} Limited`,
    quantity: qty,
    averageBuyPrice: avgPrice,
    investedAmount,
    valuationPrice: null,
    valuationDate: null,
    marketValue: null,
    unrealizedPL: null,
    unrealizedPLPct: null,
    dayChange: null,
    dayChangePct: null,
    isValuationAvailable: false,
    priceStatus: 'VALUATION_UNAVAILABLE',
    warning: `No verified historical closing price available for symbol "${holding.symbol}".`,
    notes: holding.notes || '',
    updatedAt: holding.updated_at || holding.updatedAt || new Date().toISOString(),
  };
}

/**
 * Calculate portfolio-level aggregated summary and allocation metrics
 */
export function calculatePortfolioSummary(holdingsWithValuation) {
  const totalHoldingsCount = holdingsWithValuation.length;
  const coveredHoldings = holdingsWithValuation.filter(h => h.isValuationAvailable);
  const coveredHoldingsCount = coveredHoldings.length;
  const uncoveredHoldingsCount = totalHoldingsCount - coveredHoldingsCount;

  const totalInvested = Number(
    holdingsWithValuation.reduce((sum, h) => sum + (h.investedAmount || 0), 0).toFixed(2)
  );

  const coveredInvestedAmount = Number(
    coveredHoldings.reduce((sum, h) => sum + (h.investedAmount || 0), 0).toFixed(2)
  );

  const totalMarketValue = Number(
    coveredHoldings.reduce((sum, h) => sum + (h.marketValue || 0), 0).toFixed(2)
  );

  const unrealizedPL = Number((totalMarketValue - coveredInvestedAmount).toFixed(2));
  const unrealizedPLPct = coveredInvestedAmount > 0
    ? Number(((unrealizedPL / coveredInvestedAmount) * 100).toFixed(2))
    : 0;

  // Valuation coverage percentage
  const valuationCoveragePct = totalHoldingsCount > 0
    ? Number(((coveredHoldingsCount / totalHoldingsCount) * 100).toFixed(2))
    : 100;

  // Calculate allocation percentages (% of total covered market value)
  const holdingsEnriched = holdingsWithValuation.map(h => {
    const allocationPct = totalMarketValue > 0 && h.marketValue
      ? Number(((h.marketValue / totalMarketValue) * 100).toFixed(2))
      : 0;
    return {
      ...h,
      allocationPct,
    };
  });

  // Find best and worst performing holdings by unrealized P&L %
  let largestGainer = null;
  let largestLoser = null;

  for (const h of coveredHoldings) {
    if (largestGainer === null || (h.unrealizedPLPct !== null && h.unrealizedPLPct > largestGainer.unrealizedPLPct)) {
      largestGainer = h;
    }
    if (largestLoser === null || (h.unrealizedPLPct !== null && h.unrealizedPLPct < largestLoser.unrealizedPLPct)) {
      largestLoser = h;
    }
  }

  // Derive latest valuation date across holdings
  const valuationDates = coveredHoldings
    .map(h => h.valuationDate)
    .filter(Boolean)
    .sort()
    .reverse();
  const latestValuationDate = valuationDates[0] || null;

  return {
    summary: {
      totalInvested,
      totalMarketValue,
      coveredInvestedAmount,
      unrealizedPL,
      unrealizedPLPct,
      latestValuationDate,
      totalHoldingsCount,
      coveredHoldingsCount,
      uncoveredHoldingsCount,
      valuationCoveragePct,
      isFullCoverage: uncoveredHoldingsCount === 0,
      largestGainer: largestGainer ? { symbol: largestGainer.symbol, plPct: largestGainer.unrealizedPLPct, pl: largestGainer.unrealizedPL } : null,
      largestLoser: largestLoser ? { symbol: largestLoser.symbol, plPct: largestLoser.unrealizedPLPct, pl: largestLoser.unrealizedPL } : null,
    },
    holdings: holdingsEnriched,
    valuationSource: {
      dataMode: 'HISTORICAL_EOD',
      isLiveFeed: false,
      disclaimer: 'Valuations are calculated strictly using verified historical NSE End-of-Day (EOD) Bhavcopy closing prices. These figures do not represent live intraday bids or broker cash balances.',
      realizedPLNotice: 'Realized P&L is not tracked in this module as transaction order executions have not occurred.',
    },
  };
}

export class PortfolioService {
  /**
   * List all portfolios (with summary)
   */
  async listPortfolios() {
    if (pool && isDbConnected) {
      try {
        const [rows] = await pool.query('SELECT * FROM portfolios ORDER BY created_at ASC');
        if (rows && rows.length > 0) {
          return rows.map(r => ({
            id: r.id,
            userId: r.user_id,
            name: r.name,
            description: r.description,
            currency: r.currency,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          }));
        }
      } catch (err) {
        logger.warn('[PortfolioService] MySQL listPortfolios failed, using fallback:', { error: err.message });
      }
    }

    return Array.from(IN_MEMORY_PORTFOLIOS.values());
  }

  /**
   * Get single portfolio by ID with fully evaluated holdings
   */
  async getPortfolioById(portfolioId = DEFAULT_PORTFOLIO_ID) {
    let portfolioRecord = null;
    let holdingsRows = [];

    if (pool && isDbConnected) {
      try {
        const [pRows] = await pool.query('SELECT * FROM portfolios WHERE id = ?', [portfolioId]);
        if (pRows && pRows.length > 0) {
          portfolioRecord = pRows[0];
          const [hRows] = await pool.query('SELECT * FROM portfolio_holdings WHERE portfolio_id = ? ORDER BY symbol ASC', [portfolioId]);
          holdingsRows = hRows || [];
        }
      } catch (err) {
        logger.warn('[PortfolioService] MySQL getPortfolioById query failed, falling back:', { error: err.message });
      }
    }

    if (!portfolioRecord) {
      portfolioRecord = IN_MEMORY_PORTFOLIOS.get(portfolioId);
      if (!portfolioRecord) {
        // If searching default, ensure it exists
        if (portfolioId === DEFAULT_PORTFOLIO_ID || portfolioId === 'default') {
          portfolioRecord = IN_MEMORY_PORTFOLIOS.get(DEFAULT_PORTFOLIO_ID);
        } else {
          return null;
        }
      }
      holdingsRows = Array.from(IN_MEMORY_HOLDINGS.values()).filter(h => h.portfolio_id === portfolioRecord.id);
    }

    // Enrich each holding with legitimate historical EOD price
    const enrichedHoldings = await Promise.all(
      holdingsRows.map(async (holding) => {
        const sym = holding.symbol.toUpperCase();
        let marketRecord = null;
        try {
          const history = await queryHistoricalPrices(sym, { limit: 10 });
          if (history && history.length > 0) {
            marketRecord = history[history.length - 1]; // latest available chronological close
          }
        } catch (err) {
          logger.warn(`[PortfolioService] Could not fetch market price for ${sym}:`, { error: err.message });
        }
        return calculateHoldingValuation(holding, marketRecord);
      })
    );

    const evaluated = calculatePortfolioSummary(enrichedHoldings);

    return {
      portfolio: {
        id: portfolioRecord.id,
        userId: portfolioRecord.user_id || null,
        name: portfolioRecord.name,
        description: portfolioRecord.description,
        currency: portfolioRecord.currency || 'INR',
        createdAt: portfolioRecord.created_at,
        updatedAt: portfolioRecord.updated_at,
      },
      ...evaluated,
    };
  }

  /**
   * Create a new portfolio
   */
  async createPortfolio({ name, description = null, currency = 'INR' } = {}) {
    const portfolioId = `port-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const cleanName = String(name || 'New Wealth Portfolio').trim();

    const record = {
      id: portfolioId,
      user_id: null, // local development mode
      name: cleanName,
      description: description ? String(description).trim() : null,
      currency: currency || 'INR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (pool && isDbConnected) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const sql = `
          INSERT INTO portfolios (id, user_id, name, description, currency, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `;
        await conn.query(sql, [record.id, record.user_id, record.name, record.description, record.currency]);
        await conn.commit();
      } catch (err) {
        await conn.rollback();
        logger.error('[PortfolioService] Transaction failed on createPortfolio:', { error: err.message });
        throw err;
      } finally {
        conn.release();
      }
    }

    IN_MEMORY_PORTFOLIOS.set(portfolioId, record);
    return record;
  }

  /**
   * Add a holding to a portfolio with transactional safety
   */
  async addHolding(portfolioId, { symbol, quantity, averageBuyPrice, exchange = 'NSE', notes = '' } = {}) {
    const pId = portfolioId === 'default' ? DEFAULT_PORTFOLIO_ID : portfolioId;
    const sym = String(symbol || '').trim().toUpperCase();
    const qty = Number(quantity);
    const avgPrice = Number(averageBuyPrice);

    if (!sym || !/^[A-Za-z0-9_&-]{1,30}$/.test(sym)) {
      throw new Error(`Invalid stock symbol format: "${sym}". Must be alphanumeric up to 30 characters.`);
    }
    if (isNaN(qty) || qty <= 0) {
      throw new Error(`Holding quantity must be a positive number (received: ${quantity}).`);
    }
    if (isNaN(avgPrice) || avgPrice <= 0) {
      throw new Error(`Holding average buy price must be a positive number (received: ${averageBuyPrice}).`);
    }

    const holdingId = `h-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const nowIso = new Date().toISOString();

    const holdingRecord = {
      id: holdingId,
      portfolio_id: pId,
      symbol: sym,
      exchange: String(exchange || 'NSE').toUpperCase(),
      quantity: qty,
      average_buy_price: avgPrice,
      notes: notes ? String(notes).trim() : '',
      created_at: nowIso,
      updated_at: nowIso,
    };

    // Check for duplicate symbol in this portfolio
    const existing = Array.from(IN_MEMORY_HOLDINGS.values()).find(
      h => h.portfolio_id === pId && h.symbol === sym
    );
    if (existing) {
      const err = new Error(`Symbol "${sym}" is already present in this portfolio. Use update to modify existing position.`);
      err.code = 'DUPLICATE_HOLDING';
      throw err;
    }

    if (pool && isDbConnected) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        // Check if duplicate exists in DB
        const [dupRows] = await conn.query(
          'SELECT id FROM portfolio_holdings WHERE portfolio_id = ? AND symbol = ?',
          [pId, sym]
        );
        if (dupRows && dupRows.length > 0) {
          const err = new Error(`Symbol "${sym}" is already present in portfolio.`);
          err.code = 'DUPLICATE_HOLDING';
          throw err;
        }

        const insertSql = `
          INSERT INTO portfolio_holdings (id, portfolio_id, symbol, exchange, quantity, average_buy_price, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        await conn.query(insertSql, [
          holdingRecord.id,
          holdingRecord.portfolio_id,
          holdingRecord.symbol,
          holdingRecord.exchange,
          holdingRecord.quantity,
          holdingRecord.average_buy_price,
          holdingRecord.notes,
        ]);

        await conn.commit();
      } catch (err) {
        await conn.rollback();
        if (err.code === 'ER_DUP_ENTRY') {
          const dupErr = new Error(`Symbol "${sym}" is already present in this portfolio.`);
          dupErr.code = 'DUPLICATE_HOLDING';
          throw dupErr;
        }
        logger.error('[PortfolioService] Transaction failed on addHolding:', { error: err.message });
        throw err;
      } finally {
        conn.release();
      }
    }

    IN_MEMORY_HOLDINGS.set(holdingId, holdingRecord);

    // Fetch valuation for the newly added holding
    let marketRecord = null;
    try {
      const history = await queryHistoricalPrices(sym, { limit: 5 });
      if (history && history.length > 0) {
        marketRecord = history[history.length - 1];
      }
    } catch {}

    return calculateHoldingValuation(holdingRecord, marketRecord);
  }

  /**
   * Update an existing holding's quantity, average buy price, or notes
   */
  async updateHolding(portfolioId, holdingId, { quantity, averageBuyPrice, notes } = {}) {
    const pId = portfolioId === 'default' ? DEFAULT_PORTFOLIO_ID : portfolioId;

    let existing = IN_MEMORY_HOLDINGS.get(holdingId);
    if (!existing || existing.portfolio_id !== pId) {
      // Try finding by ID directly
      existing = Array.from(IN_MEMORY_HOLDINGS.values()).find(h => h.id === holdingId && h.portfolio_id === pId);
    }

    if (!existing) {
      const err = new Error(`Holding with ID "${holdingId}" was not found in portfolio "${pId}".`);
      err.code = 'HOLDING_NOT_FOUND';
      throw err;
    }

    const updatedQty = quantity !== undefined ? Number(quantity) : Number(existing.quantity);
    const updatedAvgPrice = averageBuyPrice !== undefined ? Number(averageBuyPrice) : Number(existing.average_buy_price);

    if (isNaN(updatedQty) || updatedQty <= 0) {
      throw new Error(`Updated quantity must be a positive number (received: ${quantity}).`);
    }
    if (isNaN(updatedAvgPrice) || updatedAvgPrice <= 0) {
      throw new Error(`Updated average buy price must be a positive number (received: ${averageBuyPrice}).`);
    }

    const updatedNotes = notes !== undefined ? String(notes).trim() : existing.notes;
    const nowIso = new Date().toISOString();

    if (pool && isDbConnected) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const updateSql = `
          UPDATE portfolio_holdings
          SET quantity = ?, average_buy_price = ?, notes = ?, updated_at = NOW()
          WHERE id = ? AND portfolio_id = ?
        `;
        const [res] = await conn.query(updateSql, [updatedQty, updatedAvgPrice, updatedNotes, holdingId, pId]);
        if (res.affectedRows === 0) {
          const err = new Error(`Holding "${holdingId}" not found for update in portfolio "${pId}".`);
          err.code = 'HOLDING_NOT_FOUND';
          throw err;
        }
        await conn.commit();
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    }

    const updatedRecord = {
      ...existing,
      quantity: updatedQty,
      average_buy_price: updatedAvgPrice,
      notes: updatedNotes,
      updated_at: nowIso,
    };
    IN_MEMORY_HOLDINGS.set(holdingId, updatedRecord);

    let marketRecord = null;
    try {
      const history = await queryHistoricalPrices(updatedRecord.symbol, { limit: 5 });
      if (history && history.length > 0) marketRecord = history[history.length - 1];
    } catch {}

    return calculateHoldingValuation(updatedRecord, marketRecord);
  }

  /**
   * Delete a holding from a portfolio
   */
  async deleteHolding(portfolioId, holdingId) {
    const pId = portfolioId === 'default' ? DEFAULT_PORTFOLIO_ID : portfolioId;

    let found = IN_MEMORY_HOLDINGS.get(holdingId);
    if (!found || found.portfolio_id !== pId) {
      found = Array.from(IN_MEMORY_HOLDINGS.values()).find(h => h.id === holdingId && h.portfolio_id === pId);
    }

    if (!found) {
      const err = new Error(`Holding with ID "${holdingId}" was not found in portfolio "${pId}".`);
      err.code = 'HOLDING_NOT_FOUND';
      throw err;
    }

    if (pool && isDbConnected) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const [res] = await conn.query('DELETE FROM portfolio_holdings WHERE id = ? AND portfolio_id = ?', [holdingId, pId]);
        if (res.affectedRows === 0) {
          const err = new Error(`Holding "${holdingId}" not found for deletion.`);
          err.code = 'HOLDING_NOT_FOUND';
          throw err;
        }
        await conn.commit();
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    }

    IN_MEMORY_HOLDINGS.delete(holdingId);
    return {
      deleted: true,
      holdingId,
      symbol: found.symbol,
      portfolioId: pId,
    };
  }
}

export const portfolioService = new PortfolioService();
