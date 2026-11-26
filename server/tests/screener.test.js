import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { ingestBhavcopyFile } from '../src/services/historicalDataService.js';
import path from 'path';

describe('Market Screener & Analytics API Suite', () => {
  beforeAll(async () => {
    const fixturePath = path.resolve('../data/fixtures/nse_bhavcopy_multiday_sample.csv');
    try {
      await ingestBhavcopyFile(fixturePath);
    } catch {}
  });

  describe('GET /api/screener', () => {
    it('returns paginated stock screener results derived from historical records', async () => {
      const res = await request(app).get('/api/screener');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.dataMode).toBe('HISTORICAL_EOD');
      expect(res.body.isLive).toBe(false);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.totalRecords).toBeGreaterThan(0);

      // Verify row shape
      const stock = res.body.data[0];
      expect(stock.symbol).toBeDefined();
      expect(stock.price).toBeGreaterThan(0);
      expect(stock.volume).toBeDefined();
      expect(stock.tradeDate).toBeDefined();
    });

    it('filters screener results by search term', async () => {
      const res = await request(app).get('/api/screener?search=TCS');
      expect(res.status).toBe(200);
      expect(res.body.data.every(s => s.symbol.includes('TCS') || s.name.includes('TCS'))).toBe(true);
    });

    it('filters screener results by price range', async () => {
      const res = await request(app).get('/api/screener?minPrice=1400&maxPrice=1600');
      expect(res.status).toBe(200);
      res.body.data.forEach(s => {
        expect(s.price).toBeGreaterThanOrEqual(1400);
        expect(s.price).toBeLessThanOrEqual(1600);
      });
    });

    it('rejects inverted price range with 400', async () => {
      const res = await request(app).get('/api/screener?minPrice=3000&maxPrice=1000');
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_PRICE_RANGE');
    });

    it('sorts by price in ascending order', async () => {
      const res = await request(app).get('/api/screener?sortBy=price&sortOrder=asc&limit=10');
      expect(res.status).toBe(200);
      const prices = res.body.data.map(s => s.price);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
      }
    });

    it('supports pagination metadata', async () => {
      const res = await request(app).get('/api/screener?page=1&limit=2');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
      expect(res.body.pagination.limit).toBe(2);
      expect(res.body.pagination.totalPages).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/market/stocks/:symbol/analytics', () => {
    it('returns calculated analytics and volatility for a symbol', async () => {
      const res = await request(app).get('/api/market/stocks/RELIANCE/analytics');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.symbol).toBe('RELIANCE');
      expect(res.body.metrics.latestClose).toBeGreaterThan(0);
      expect(res.body.metrics.annualizedVolatilityPct).toBeGreaterThan(0);
      expect(res.body.formulaDocumentation).toBeDefined();
    });

    it('returns 404 for symbol with no data', async () => {
      const res = await request(app).get('/api/market/stocks/UNKNOWN_XYZ/analytics');
      expect(res.status).toBe(404);
      expect(res.body.code).toBe('DATA_NOT_FOUND');
    });
  });

  describe('GET /api/market/movers', () => {
    it('returns calculated top gainers from historical dataset', async () => {
      const res = await request(app).get('/api/market/movers?type=gainers&limit=3');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.gainers)).toBe(true);
      expect(res.body.gainers.length).toBeLessThanOrEqual(3);
    });

    it('returns calculated top losers from historical dataset', async () => {
      const res = await request(app).get('/api/market/movers?type=losers&limit=3');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.losers)).toBe(true);
    });
  });

  describe('GET /api/market/indices (Data Integrity Check)', () => {
    it('returns explicit unavailable status without fabricating benchmark index values', async () => {
      const res = await request(app).get('/api/market/indices');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('unavailable');
      expect(res.body.available).toBe(false);
      expect(res.body.requiredDataSource).toBeDefined();
      expect(res.body.disclaimer).toContain('individual equity records are never fabricated into proprietary exchange-weighted benchmark indices');
    });
  });
});
