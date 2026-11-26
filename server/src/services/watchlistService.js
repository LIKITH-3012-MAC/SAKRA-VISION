import crypto from 'crypto';
import { pool, isDbConnected } from '../config/db.js';
import { queryHistoricalPrices } from './historicalDataService.js';
import { logger } from '../utils/logger.js';

export const IN_MEMORY_WATCHLISTS = new Map();
export const IN_MEMORY_WATCHLIST_ITEMS = new Map(); // key: itemId, value: itemRecord

const DEFAULT_WATCHLIST_ID = 'wl-primary';

IN_MEMORY_WATCHLISTS.set(DEFAULT_WATCHLIST_ID, {
  id: DEFAULT_WATCHLIST_ID,
  user_id: null,
  name: 'Primary Monitored Equities',
  description: 'Core Indian equities under quantitative surveillance',
  created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
  updated_at: new Date().toISOString(),
});

const DEFAULT_ITEMS_SEED = [
  { id: 'wi-rel-1', watchlist_id: DEFAULT_WATCHLIST_ID, symbol: 'RELIANCE', notes: 'Energy transition and retail footprint' },
  { id: 'wi-hdfc-2', watchlist_id: DEFAULT_WATCHLIST_ID, symbol: 'HDFCBANK', notes: 'Post-merger credit growth and net interest margins' },
  { id: 'wi-tcs-3', watchlist_id: DEFAULT_WATCHLIST_ID, symbol: 'TCS', notes: 'Large enterprise digital deals pipeline' },
  { id: 'wi-infy-4', watchlist_id: DEFAULT_WATCHLIST_ID, symbol: 'INFY', notes: 'Enterprise generative AI services momentum' },
  { id: 'wi-bharti-5', watchlist_id: DEFAULT_WATCHLIST_ID, symbol: 'BHARTIARTL', notes: 'ARPU expansion and 5G capital discipline' },
];

for (const item of DEFAULT_ITEMS_SEED) {
  IN_MEMORY_WATCHLIST_ITEMS.set(item.id, {
    ...item,
    created_at: new Date().toISOString(),
  });
}

/**
 * Ensure database tables exist in MySQL
 */
export async function ensureWatchlistTables() {
  if (!pool || !isDbConnected) return false;

  const createWatchlistsSql = `
    CREATE TABLE IF NOT EXISTS watchlists (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NULL,
      name VARCHAR(100) NOT NULL DEFAULT 'Primary Monitored Equities',
      description VARCHAR(255) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_watchlists_user_id (user_id)
    ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `;

  const createItemsSql = `
    CREATE TABLE IF NOT EXISTS watchlist_items (
      id VARCHAR(36) PRIMARY KEY,
      watchlist_id VARCHAR(36) NOT NULL,
      symbol VARCHAR(30) NOT NULL,
      notes TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_watchlist_symbol (watchlist_id, symbol),
      INDEX idx_items_watchlist_id (watchlist_id),
      INDEX idx_items_symbol (symbol),
      CONSTRAINT fk_items_watchlist
        FOREIGN KEY (watchlist_id) REFERENCES watchlists (id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `;

  try {
    await pool.query(createWatchlistsSql);
    await pool.query(createItemsSql);
    return true;
  } catch (err) {
    logger.warn('[WatchlistService] Could not ensure watchlist tables in MySQL:', { error: err.message });
    return false;
  }
}

/**
 * Enrich a watchlist item with the latest historical EOD closing quote
 */
async function enrichWatchlistItem(item) {
  const sym = item.symbol.toUpperCase();
  let marketRecord = null;
  try {
    const history = await queryHistoricalPrices(sym, { limit: 10 });
    if (history && history.length > 0) {
      marketRecord = history[history.length - 1];
    }
  } catch (err) {
    logger.warn(`[WatchlistService] Market query failed for ${sym}:`, { error: err.message });
  }

  if (marketRecord && typeof marketRecord.close === 'number' && marketRecord.close > 0) {
    const closePrice = Number(marketRecord.close.toFixed(2));
    const previousClose = typeof marketRecord.previousClose === 'number' ? marketRecord.previousClose : closePrice;
    const change = Number((closePrice - previousClose).toFixed(2));
    const changePct = previousClose > 0 ? Number(((change / previousClose) * 100).toFixed(2)) : 0;

    return {
      id: item.id,
      watchlistId: item.watchlist_id || item.watchlistId,
      symbol: sym,
      companyName: marketRecord.companyName || `${sym} Limited`,
      isin: marketRecord.isin || null,
      series: marketRecord.series || 'EQ',
      latestClose: closePrice,
      previousClose,
      change,
      changePct,
      volume: marketRecord.volume || 0,
      tradeDate: marketRecord.tradeDate,
      hasData: true,
      priceStatus: 'VERIFIED_HISTORICAL_EOD',
      notes: item.notes || '',
      createdAt: item.created_at || item.createdAt || new Date().toISOString(),
    };
  }

  return {
    id: item.id,
    watchlistId: item.watchlist_id || item.watchlistId,
    symbol: sym,
    companyName: `${sym} Limited`,
    isin: null,
    series: 'EQ',
    latestClose: null,
    previousClose: null,
    change: null,
    changePct: null,
    volume: null,
    tradeDate: null,
    hasData: false,
    priceStatus: 'VALUATION_UNAVAILABLE',
    warning: `No verified historical records found for symbol "${sym}".`,
    notes: item.notes || '',
    createdAt: item.created_at || item.createdAt || new Date().toISOString(),
  };
}

export class WatchlistService {
  /**
   * List all watchlists
   */
  async listWatchlists() {
    let watchlists = [];

    if (pool && isDbConnected) {
      try {
        const [rows] = await pool.query('SELECT * FROM watchlists ORDER BY created_at ASC');
        if (rows && rows.length > 0) {
          watchlists = rows.map(r => ({
            id: r.id,
            userId: r.user_id,
            name: r.name,
            description: r.description,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          }));
        }
      } catch (err) {
        logger.warn('[WatchlistService] MySQL listWatchlists failed, using fallback:', { error: err.message });
      }
    }

    if (watchlists.length === 0) {
      watchlists = Array.from(IN_MEMORY_WATCHLISTS.values());
    }

    // Attach item count to each watchlist
    const results = await Promise.all(
      watchlists.map(async (wl) => {
        let itemCount = 0;
        if (pool && isDbConnected) {
          try {
            const [cRows] = await pool.query('SELECT COUNT(*) as cnt FROM watchlist_items WHERE watchlist_id = ?', [wl.id]);
            itemCount = cRows[0]?.cnt || 0;
          } catch {}
        } else {
          itemCount = Array.from(IN_MEMORY_WATCHLIST_ITEMS.values()).filter(i => i.watchlist_id === wl.id).length;
        }
        return {
          ...wl,
          itemCount,
        };
      })
    );

    return results;
  }

  /**
   * Get single watchlist by ID with enriched market quotes
   */
  async getWatchlistById(watchlistId = DEFAULT_WATCHLIST_ID) {
    let wlRecord = null;
    let itemRows = [];

    if (pool && isDbConnected) {
      try {
        const [wRows] = await pool.query('SELECT * FROM watchlists WHERE id = ?', [watchlistId]);
        if (wRows && wRows.length > 0) {
          wlRecord = wRows[0];
          const [iRows] = await pool.query('SELECT * FROM watchlist_items WHERE watchlist_id = ? ORDER BY symbol ASC', [watchlistId]);
          itemRows = iRows || [];
        }
      } catch (err) {
        logger.warn('[WatchlistService] MySQL getWatchlistById failed, falling back:', { error: err.message });
      }
    }

    if (!wlRecord) {
      wlRecord = IN_MEMORY_WATCHLISTS.get(watchlistId);
      if (!wlRecord) {
        if (watchlistId === DEFAULT_WATCHLIST_ID || watchlistId === 'default') {
          wlRecord = IN_MEMORY_WATCHLISTS.get(DEFAULT_WATCHLIST_ID);
        } else {
          return null;
        }
      }
      itemRows = Array.from(IN_MEMORY_WATCHLIST_ITEMS.values()).filter(i => i.watchlist_id === wlRecord.id);
    }

    const enrichedItems = await Promise.all(itemRows.map(enrichWatchlistItem));

    return {
      watchlist: {
        id: wlRecord.id,
        userId: wlRecord.user_id || null,
        name: wlRecord.name,
        description: wlRecord.description,
        createdAt: wlRecord.created_at,
        updatedAt: wlRecord.updated_at,
        itemCount: enrichedItems.length,
      },
      items: enrichedItems,
      dataMode: 'HISTORICAL_EOD',
      isLiveFeed: false,
    };
  }

  /**
   * Create a new watchlist
   */
  async createWatchlist({ name, description = null } = {}) {
    const cleanName = String(name || 'New Watchlist').trim();
    if (!cleanName) {
      throw new Error('Watchlist name is required.');
    }

    const watchlistId = `wl-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const nowIso = new Date().toISOString();

    const record = {
      id: watchlistId,
      user_id: null,
      name: cleanName,
      description: description ? String(description).trim() : null,
      created_at: nowIso,
      updated_at: nowIso,
    };

    if (pool && isDbConnected) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const sql = `
          INSERT INTO watchlists (id, user_id, name, description, created_at, updated_at)
          VALUES (?, ?, ?, ?, NOW(), NOW())
        `;
        await conn.query(sql, [record.id, record.user_id, record.name, record.description]);
        await conn.commit();
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    }

    IN_MEMORY_WATCHLISTS.set(watchlistId, record);
    return record;
  }

  /**
   * Add a stock to a watchlist (with duplicate prevention)
   */
  async addWatchlistItem(watchlistId, { symbol, notes = '' } = {}) {
    const wId = watchlistId === 'default' ? DEFAULT_WATCHLIST_ID : watchlistId;
    const sym = String(symbol || '').trim().toUpperCase();

    if (!sym || !/^[A-Za-z0-9_&-]{1,30}$/.test(sym)) {
      throw new Error(`Invalid stock symbol format: "${sym}". Must be alphanumeric up to 30 characters.`);
    }

    // Check duplicate in memory
    const existing = Array.from(IN_MEMORY_WATCHLIST_ITEMS.values()).find(
      i => i.watchlist_id === wId && i.symbol === sym
    );
    if (existing) {
      const err = new Error(`Symbol "${sym}" is already present in this watchlist.`);
      err.code = 'DUPLICATE_WATCHLIST_ITEM';
      throw err;
    }

    const itemId = `wi-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const nowIso = new Date().toISOString();

    const itemRecord = {
      id: itemId,
      watchlist_id: wId,
      symbol: sym,
      notes: notes ? String(notes).trim() : '',
      created_at: nowIso,
    };

    if (pool && isDbConnected) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        const [dupRows] = await conn.query(
          'SELECT id FROM watchlist_items WHERE watchlist_id = ? AND symbol = ?',
          [wId, sym]
        );
        if (dupRows && dupRows.length > 0) {
          const err = new Error(`Symbol "${sym}" is already present in this watchlist.`);
          err.code = 'DUPLICATE_WATCHLIST_ITEM';
          throw err;
        }

        const sql = `
          INSERT INTO watchlist_items (id, watchlist_id, symbol, notes, created_at)
          VALUES (?, ?, ?, ?, NOW())
        `;
        await conn.query(sql, [itemRecord.id, itemRecord.watchlist_id, itemRecord.symbol, itemRecord.notes]);
        await conn.commit();
      } catch (err) {
        await conn.rollback();
        if (err.code === 'ER_DUP_ENTRY') {
          const dupErr = new Error(`Symbol "${sym}" is already present in this watchlist.`);
          dupErr.code = 'DUPLICATE_WATCHLIST_ITEM';
          throw dupErr;
        }
        throw err;
      } finally {
        conn.release();
      }
    }

    IN_MEMORY_WATCHLIST_ITEMS.set(itemId, itemRecord);
    return enrichWatchlistItem(itemRecord);
  }

  /**
   * Remove a stock from a watchlist (by itemId or symbol)
   */
  async removeWatchlistItem(watchlistId, itemIdOrSymbol) {
    const wId = watchlistId === 'default' ? DEFAULT_WATCHLIST_ID : watchlistId;
    const target = String(itemIdOrSymbol).trim();

    // Check in memory first
    let found = IN_MEMORY_WATCHLIST_ITEMS.get(target);
    if (!found || found.watchlist_id !== wId) {
      // Try finding by symbol
      found = Array.from(IN_MEMORY_WATCHLIST_ITEMS.values()).find(
        i => i.watchlist_id === wId && (i.id === target || i.symbol.toUpperCase() === target.toUpperCase())
      );
    }

    if (!found) {
      const err = new Error(`Item "${target}" not found in watchlist "${wId}".`);
      err.code = 'WATCHLIST_ITEM_NOT_FOUND';
      throw err;
    }

    if (pool && isDbConnected) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const [res] = await conn.query(
          'DELETE FROM watchlist_items WHERE watchlist_id = ? AND (id = ? OR symbol = ?)',
          [wId, found.id, found.symbol]
        );
        if (res.affectedRows === 0) {
          const err = new Error(`Item "${target}" not found for deletion in database.`);
          err.code = 'WATCHLIST_ITEM_NOT_FOUND';
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

    IN_MEMORY_WATCHLIST_ITEMS.delete(found.id);
    return {
      deleted: true,
      itemId: found.id,
      symbol: found.symbol,
      watchlistId: wId,
    };
  }
}

export const watchlistService = new WatchlistService();
