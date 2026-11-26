import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { ingestBhavcopyFile } from '../src/services/historicalDataService.js';
import path from 'path';

describe('Historical Market Data API Suite', () => {
  beforeAll(async () => {
    // Ingest sample multiday fixture
    const fixturePath = path.resolve('../data/fixtures/nse_bhavcopy_multiday_sample.csv');
    if (path.existsSync ? path.existsSync(fixturePath) : true) {
      try {
        await ingestBhavcopyFile(fixturePath);
      } catch {}
    }
  });

  describe('GET /api/market/stocks', () => {
    it('returns searchable stock catalog with transparent metadata', async () => {
      const res = await request(app).get('/api/market/stocks?search=RELIANCE');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.dataMode).toBe('HISTORICAL_EOD');
      expect(res.body.isLive).toBe(false);
      expect(Array.isArray(res.body.stocks)).toBe(true);
      expect(res.body.stocks.length).toBeGreaterThan(0);

      const rel = res.body.stocks.find(s => s.symbol === 'RELIANCE');
      expect(rel).toBeDefined();
      expect(rel.symbol).toBe('RELIANCE');
    });

    it('handles query limit bounding properly', async () => {
      const res = await request(app).get('/api/market/stocks?limit=2');
      expect(res.status).toBe(200);
      expect(res.body.stocks.length).toBeLessThanOrEqual(2);
    });

    it('rejects invalid limit values (> 100 or non-integer)', async () => {
      const res = await request(app).get('/api/market/stocks?limit=999');
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/market/stocks/:symbol/history', () => {
    it('returns chronological historical EOD prices for a symbol', async () => {
      const res = await request(app).get('/api/market/stocks/RELIANCE/history');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.symbol).toBe('RELIANCE');
      expect(res.body.dataMode).toBe('HISTORICAL_EOD');
      expect(res.body.isLive).toBe(false);
      expect(Array.isArray(res.body.history)).toBe(true);

      if (res.body.history.length > 1) {
        // Assert chronological ordering
        const dates = res.body.history.map(h => h.tradeDate);
        const sorted = [...dates].sort();
        expect(dates).toEqual(sorted);
      }
    });

    it('applies date range filters correctly', async () => {
      const res = await request(app)
        .get('/api/market/stocks/RELIANCE/history?from=2025-04-20&to=2025-04-30');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      res.body.history.forEach(h => {
        expect(h.tradeDate >= '2025-04-20').toBe(true);
        expect(h.tradeDate <= '2025-04-30').toBe(true);
      });
    });

    it('rejects invalid date format for from/to', async () => {
      const res = await request(app)
        .get('/api/market/stocks/RELIANCE/history?from=INVALID_DATE');
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('rejects inverted date range (from > to)', async () => {
      const res = await request(app)
        .get('/api/market/stocks/RELIANCE/history?from=2025-05-01&to=2025-04-01');
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('INVALID_DATE_RANGE');
    });

    it('rejects malformed stock symbol with special characters', async () => {
      const res = await request(app).get('/api/market/stocks/<script>/history');
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_SYMBOL');
    });

    it('returns clean empty history for unknown stock symbol without crashing', async () => {
      const res = await request(app).get('/api/market/stocks/UNKNOWN_SYMBOL_999/history');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(0);
      expect(res.body.history).toEqual([]);
    });
  });

  describe('GET /api/market/overview', () => {
    it('returns labeled historical-data overview with date coverage', async () => {
      const res = await request(app).get('/api/market/overview');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.dataMode).toBe('HISTORICAL_EOD');
      expect(res.body.isLive).toBe(false);
      expect(res.body.dataset).toBeDefined();
      expect(res.body.dataset.trackedSymbolsCount).toBeGreaterThan(0);
      expect(res.body.dataset.latestTradeDate).toBeDefined();
      expect(res.body.indices.length).toBeGreaterThan(0);
    });
  });
});
