import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import path from 'path';
import app from '../src/app.js';
import {
  calculateHoldingValuation,
  calculatePortfolioSummary,
  portfolioService,
  IN_MEMORY_HOLDINGS,
} from '../src/services/portfolioService.js';
import {
  watchlistService,
  IN_MEMORY_WATCHLIST_ITEMS,
} from '../src/services/watchlistService.js';
import { ingestBhavcopyFile } from '../src/services/historicalDataService.js';

describe('Phase 6: Portfolio Management & Watchlists Suite', () => {
  beforeAll(async () => {
    // Ingest multiday bhavcopy sample fixture so legitimate historical EOD closes exist
    const fixturePath = path.resolve('../data/fixtures/nse_bhavcopy_multiday_sample.csv');
    try {
      await ingestBhavcopyFile(fixturePath);
    } catch {
      // Ignore if already loaded or fallback used
    }
  });

  // =========================================================================
  // 1. PORTFOLIO VALUATION FORMULAS & DECIMAL ARITHMETIC
  // =========================================================================
  describe('Portfolio Mathematical Calculations & Coverage Logic', () => {
    it('calculates invested amount, market value, and unrealized P&L correctly', () => {
      // 100 shares @ ₹2,500.00 avg price, historical close = ₹2,800.00
      const holding = {
        id: 'h-test-1',
        portfolioId: 'port-1',
        symbol: 'RELIANCE',
        quantity: 100,
        average_buy_price: 2500.00,
      };
      const marketData = {
        close: 2800.00,
        previousClose: 2750.00,
        tradeDate: '2024-03-15',
        companyName: 'Reliance Industries Limited',
      };

      const result = calculateHoldingValuation(holding, marketData);

      expect(result.investedAmount).toBe(250000.00); // 100 * 2500
      expect(result.marketValue).toBe(280000.00);   // 100 * 2800
      expect(result.unrealizedPL).toBe(30000.00);    // 280000 - 250000
      expect(result.unrealizedPLPct).toBe(12.00);    // (30000 / 250000) * 100
      expect(result.valuationPrice).toBe(2800.00);
      expect(result.valuationDate).toBe('2024-03-15');
      expect(result.isValuationAvailable).toBe(true);
      expect(result.priceStatus).toBe('VERIFIED_HISTORICAL_EOD');
    });

    it('calculates fractional quantities and rounding accurately', () => {
      // Fractional share quantity (e.g. 12.3456 shares @ ₹1,420.50)
      const holding = {
        id: 'h-test-frac',
        symbol: 'INFY',
        quantity: 12.3456,
        average_buy_price: 1420.50,
      };
      const marketData = {
        close: 1510.25,
        previousClose: 1500.00,
        tradeDate: '2024-03-15',
      };

      const result = calculateHoldingValuation(holding, marketData);

      expect(result.investedAmount).toBe(17536.92); // (12.3456 * 1420.50).toFixed(2)
      expect(result.marketValue).toBe(18644.94);   // (12.3456 * 1510.25).toFixed(2)
      expect(result.unrealizedPL).toBe(1108.02);    // 18644.94 - 17536.92
      expect(result.unrealizedPLPct).toBe(6.32);     // (1108.02 / 17536.92) * 100
    });

    it('rejects invalid or zero quantity and price safely', () => {
      expect(() => calculateHoldingValuation({ quantity: 0, average_buy_price: 100, symbol: 'TEST' })).toThrow(
        /Invalid holding parameters/
      );
      expect(() => calculateHoldingValuation({ quantity: -10, average_buy_price: 100, symbol: 'TEST' })).toThrow(
        /Invalid holding parameters/
      );
      expect(() => calculateHoldingValuation({ quantity: 50, average_buy_price: 0, symbol: 'TEST' })).toThrow(
        /Invalid holding parameters/
      );
      expect(() => calculateHoldingValuation({ quantity: 50, average_buy_price: -50, symbol: 'TEST' })).toThrow(
        /Invalid holding parameters/
      );
    });

    it('handles missing/stale prices safely without fabricating zero or fake prices', () => {
      const holding = {
        id: 'h-unknown-1',
        symbol: 'UNKNOWN_EQUITY',
        quantity: 50,
        average_buy_price: 100.00,
      };

      // No market record available
      const result = calculateHoldingValuation(holding, null);

      expect(result.investedAmount).toBe(5000.00);
      expect(result.valuationPrice).toBeNull();
      expect(result.marketValue).toBeNull();
      expect(result.unrealizedPL).toBeNull();
      expect(result.unrealizedPLPct).toBeNull();
      expect(result.isValuationAvailable).toBe(false);
      expect(result.priceStatus).toBe('VALUATION_UNAVAILABLE');
      expect(result.warning).toContain('No verified historical closing price available');
    });

    it('aggregates portfolio summary with partial valuation coverage transparently', () => {
      const holdings = [
        // Holding 1: Covered (Market Value = 10,000, Invested = 8,000, Gain = 2,000)
        {
          id: 'h1',
          symbol: 'RELIANCE',
          investedAmount: 8000.00,
          marketValue: 10000.00,
          isValuationAvailable: true,
          unrealizedPLPct: 25.00,
          unrealizedPL: 2000.00,
        },
        // Holding 2: Covered (Market Value = 5,000, Invested = 6,000, Loss = -1,000)
        {
          id: 'h2',
          symbol: 'TCS',
          investedAmount: 6000.00,
          marketValue: 5000.00,
          isValuationAvailable: true,
          unrealizedPLPct: -16.67,
          unrealizedPL: -1000.00,
        },
        // Holding 3: Uncovered (No market data, Invested = 4,000)
        {
          id: 'h3',
          symbol: 'UNLISTED_CO',
          investedAmount: 4000.00,
          marketValue: null,
          isValuationAvailable: false,
          unrealizedPLPct: null,
          unrealizedPL: null,
        },
      ];

      const { summary, holdings: enriched } = calculatePortfolioSummary(holdings);

      expect(summary.totalHoldingsCount).toBe(3);
      expect(summary.coveredHoldingsCount).toBe(2);
      expect(summary.uncoveredHoldingsCount).toBe(1);
      expect(summary.valuationCoveragePct).toBe(66.67);
      expect(summary.isFullCoverage).toBe(false);

      // Total invested includes all 3 holdings (8,000 + 6,000 + 4,000 = 18,000)
      expect(summary.totalInvested).toBe(18000.00);

      // Covered invested amount is strictly 8,000 + 6,000 = 14,000
      expect(summary.coveredInvestedAmount).toBe(14000.00);

      // Market value is strictly 10,000 + 5,000 = 15,000
      expect(summary.totalMarketValue).toBe(15000.00);

      // Unrealized P&L = 15,000 - 14,000 = 1,000 (+7.14%)
      expect(summary.unrealizedPL).toBe(1000.00);
      expect(summary.unrealizedPLPct).toBe(7.14);

      // Allocation check: H1 = (10,000 / 15,000) * 100 = 66.67%, H2 = 33.33%, H3 = 0%
      expect(enriched.find(h => h.id === 'h1').allocationPct).toBe(66.67);
      expect(enriched.find(h => h.id === 'h2').allocationPct).toBe(33.33);
      expect(enriched.find(h => h.id === 'h3').allocationPct).toBe(0);

      // Top gainer and loser
      expect(summary.largestGainer.symbol).toBe('RELIANCE');
      expect(summary.largestLoser.symbol).toBe('TCS');
    });
  });

  // =========================================================================
  // 2. PORTFOLIO API ENDPOINTS INTEGRATION
  // =========================================================================
  describe('Portfolio REST API Endpoints', () => {
    it('GET /api/portfolio returns default portfolio with valuation and auth disclaimer', async () => {
      const res = await request(app).get('/api/portfolio');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.authMode).toBe('LOCAL_DEVELOPMENT_ONLY');
      expect(res.body.isMultiUserAuthenticated).toBe(false);
      expect(res.body.portfolio).toBeDefined();
      expect(res.body.summary).toBeDefined();
      expect(typeof res.body.summary.totalInvested).toBe('number');
      expect(typeof res.body.summary.totalMarketValue).toBe('number');
      expect(Array.isArray(res.body.holdings)).toBe(true);
      expect(res.body.valuationSource.dataMode).toBe('HISTORICAL_EOD');
    });

    it('GET /api/portfolio/list returns available portfolios', async () => {
      const res = await request(app).get('/api/portfolio/list');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.portfolios)).toBe(true);
      expect(res.body.portfolios.length).toBeGreaterThan(0);
    });

    it('POST /api/portfolio creates a new portfolio', async () => {
      const payload = {
        name: 'Growth & Compounders',
        description: 'Mid and large cap quality equities',
        currency: 'INR',
      };

      const res = await request(app).post('/api/portfolio').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.portfolio.id).toBeDefined();
      expect(res.body.portfolio.name).toBe('Growth & Compounders');
    });

    it('POST /api/portfolio rejects empty name with 400', async () => {
      const res = await request(app).post('/api/portfolio').send({ name: '' });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('POST /api/portfolio/:id/holdings adds a new holding', async () => {
      const holdingPayload = {
        symbol: 'BHARTIARTL',
        quantity: 80,
        averageBuyPrice: 1150.00,
        exchange: 'NSE',
        notes: 'Telecom ARPU growth play',
      };

      const res = await request(app).post('/api/portfolio/default/holdings').send(holdingPayload);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.holding).toBeDefined();
      expect(res.body.holding.symbol).toBe('BHARTIARTL');
      expect(res.body.holding.quantity).toBe(80);
      expect(res.body.holding.averageBuyPrice).toBe(1150.00);
      expect(res.body.holding.investedAmount).toBe(92000.00);
    });

    it('POST /api/portfolio/:id/holdings rejects duplicate holding with 409', async () => {
      const dupPayload = {
        symbol: 'BHARTIARTL', // Already added above
        quantity: 20,
        averageBuyPrice: 1200.00,
      };

      const res = await request(app).post('/api/portfolio/default/holdings').send(dupPayload);

      expect(res.status).toBe(409);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('DUPLICATE_HOLDING');
    });

    it('POST /api/portfolio/:id/holdings rejects negative quantity or price with 400', async () => {
      const res1 = await request(app).post('/api/portfolio/default/holdings').send({
        symbol: 'SBIN',
        quantity: -10,
        averageBuyPrice: 750,
      });
      expect(res1.status).toBe(400);

      const res2 = await request(app).post('/api/portfolio/default/holdings').send({
        symbol: 'SBIN',
        quantity: 10,
        averageBuyPrice: 0,
      });
      expect(res2.status).toBe(400);
    });

    it('PATCH /api/portfolio/:id/holdings/:holdingId updates holding quantity and price', async () => {
      // Find the BHARTIARTL holding
      const pRes = await request(app).get('/api/portfolio/default');
      const bharti = pRes.body.holdings.find(h => h.symbol === 'BHARTIARTL');
      expect(bharti).toBeDefined();

      const updatePayload = {
        quantity: 100, // Updated from 80
        averageBuyPrice: 1180.00,
        notes: 'Averaged up on strong 5G subscriber additions',
      };

      const res = await request(app)
        .patch(`/api/portfolio/default/holdings/${bharti.id}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.holding.quantity).toBe(100);
      expect(res.body.holding.averageBuyPrice).toBe(1180.00);
      expect(res.body.holding.investedAmount).toBe(118000.00);
    });

    it('DELETE /api/portfolio/:id/holdings/:holdingId removes a holding', async () => {
      const pRes = await request(app).get('/api/portfolio/default');
      const bharti = pRes.body.holdings.find(h => h.symbol === 'BHARTIARTL');
      expect(bharti).toBeDefined();

      const delRes = await request(app).delete(`/api/portfolio/default/holdings/${bharti.id}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.status).toBe('success');
      expect(delRes.body.deleted).toBe(true);

      // Verify holding is no longer present
      const afterRes = await request(app).get('/api/portfolio/default');
      const notFound = afterRes.body.holdings.find(h => h.symbol === 'BHARTIARTL');
      expect(notFound).toBeUndefined();
    });

    it('DELETE /api/portfolio/:id/holdings/:holdingId returns 404 for unknown holding', async () => {
      const res = await request(app).delete('/api/portfolio/default/holdings/h-unknown-xyz-999');

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('HOLDING_NOT_FOUND');
    });
  });

  // =========================================================================
  // 3. WATCHLIST API ENDPOINTS INTEGRATION
  // =========================================================================
  describe('Watchlists REST API Endpoints', () => {
    it('GET /api/watchlists returns all watchlists with item counts', async () => {
      const res = await request(app).get('/api/watchlists');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.authMode).toBe('LOCAL_DEVELOPMENT_ONLY');
      expect(Array.isArray(res.body.watchlists)).toBe(true);
      expect(res.body.watchlists.length).toBeGreaterThan(0);
    });

    it('GET /api/watchlists/:id returns watchlist with enriched quotes and trade dates', async () => {
      const res = await request(app).get('/api/watchlists/wl-primary');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.watchlist).toBeDefined();
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBeGreaterThan(0);

      // Verify RELIANCE item has historical EOD close attached
      const relItem = res.body.items.find(i => i.symbol === 'RELIANCE');
      expect(relItem).toBeDefined();
      expect(relItem.hasData).toBe(true);
      expect(typeof relItem.latestClose).toBe('number');
      expect(relItem.tradeDate).toBeDefined();
    });

    it('POST /api/watchlists creates a new watchlist', async () => {
      const payload = {
        name: 'High Beta Momentum',
        description: 'Stocks with elevated volatility and volume breakouts',
      };

      const res = await request(app).post('/api/watchlists').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.watchlist.id).toBeDefined();
      expect(res.body.watchlist.name).toBe('High Beta Momentum');
    });

    it('POST /api/watchlists/:id/items adds an item to watchlist', async () => {
      const payload = {
        symbol: 'SBIN',
        notes: 'Public sector bank credit expansion watch',
      };

      const res = await request(app).post('/api/watchlists/wl-primary/items').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.item.symbol).toBe('SBIN');
    });

    it('POST /api/watchlists/:id/items prevents duplicate symbols with 409', async () => {
      const dupPayload = {
        symbol: 'SBIN', // Already added above
        notes: 'Duplicate attempt',
      };

      const res = await request(app).post('/api/watchlists/wl-primary/items').send(dupPayload);

      expect(res.status).toBe(409);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('DUPLICATE_ITEM');
    });

    it('POST /api/watchlists/:id/items rejects malformed symbol with 400', async () => {
      const res = await request(app).post('/api/watchlists/wl-primary/items').send({
        symbol: 'INVALID SYMBOL !?',
      });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('DELETE /api/watchlists/:id/items/:itemId removes item by symbol', async () => {
      const res = await request(app).delete('/api/watchlists/wl-primary/items/SBIN');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.deleted).toBe(true);
      expect(res.body.symbol).toBe('SBIN');
    });

    it('DELETE /api/watchlists/:id/items/:itemId returns 404 for non-existent item', async () => {
      const res = await request(app).delete('/api/watchlists/wl-primary/items/NONEXISTENT_STOCK');

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('ITEM_NOT_FOUND');
    });
  });
});
