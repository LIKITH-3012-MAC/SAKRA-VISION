import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('SAKRA VISION REST API Suite', () => {
  it('GET /api/health returns 200 with server status and safe configuration', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.product).toBe('SAKRA VISION');
    expect(res.body.uptimeSeconds).toBeDefined();
    expect(res.body.databaseConfig).toBeDefined();
    expect(res.body.databaseConfig.host).toBeDefined();
    expect(res.body.databaseConfig.password).toBeUndefined(); // Strictly no secret exposure
  });

  it('GET /api/health/db returns structured diagnostic response without credentials', async () => {
    const res = await request(app).get('/api/health/db');
    // Depending on whether Aiven MySQL is connected or running in resilient/unconfigured mode,
    // status must be either 200 (healthy) or 503 (unavailable/unreachable).
    expect([200, 503]).toContain(res.status);
    expect(res.body.database).toBeDefined();
    expect(typeof res.body.database.connected).toBe('boolean');
    expect(res.body.database.host).toBeDefined();
    expect(res.body.database.password).toBeUndefined(); // Zero secret leakage
    if (!res.body.database.connected) {
      expect(Array.isArray(res.body.database.missingPrerequisites)).toBe(true);
    }
  });

  it('GET /api/nonexistent-route returns structured 404 error', async () => {
    const res = await request(app).get('/api/nonexistent-route');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.code).toBe('ROUTE_NOT_FOUND');
  });

  it('GET /api/v1/health returns backwards-compatible status and service flags', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.product).toBe('SAKRA VISION');
  });

  it('GET /api/v1/market/overview returns market indices and breadth', async () => {
    const res = await request(app).get('/api/v1/market/overview');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.breadth).toBeDefined();
    expect(res.body.indices.length).toBeGreaterThan(0);
    expect(res.body.movers).toBeDefined();
  });

  it('GET /api/v1/stocks returns list of Indian equities', async () => {
    const res = await request(app).get('/api/v1/stocks');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.stocks)).toBe(true);
    expect(res.body.stocks.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/stocks/:symbol returns specific stock detail', async () => {
    const res = await request(app).get('/api/v1/stocks/RELIANCE');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.stock.symbol).toBe('RELIANCE');
    expect(res.body.stock.exchange).toBe('NSE');
  });

  it('POST /api/v1/portfolio/holdings validates inputs with Zod', async () => {
    // Missing quantity and invalid price
    const res = await request(app)
      .post('/api/v1/portfolio/holdings')
      .send({ symbol: 'INFY', quantity: -5, avgPrice: 0 });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.code).toBe('VALIDATION_ERROR');
    expect(res.body.errors).toBeDefined();
  });

  it('POST /api/v1/portfolio/holdings records valid holding successfully', async () => {
    const res = await request(app)
      .post('/api/v1/portfolio/holdings')
      .send({
        symbol: 'BHARTIARTL',
        exchange: 'NSE',
        quantity: 50,
        avgPrice: 1720.00,
        sector: 'Telecommunications',
      });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.holding.symbol).toBe('BHARTIARTL');
  });
});
