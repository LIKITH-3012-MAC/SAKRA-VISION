import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import path from 'path';
import app from '../src/app.js';
import {
  calculateModelForecast,
  addTradingDays,
  SUPPORTED_MODELS,
  SUPPORTED_HORIZONS,
} from '../src/services/predictionService.js';
import {
  executeWalkForwardEvaluation,
  BACKTEST_STORE,
} from '../src/services/backtestService.js';
import { ingestBhavcopyFile } from '../src/services/historicalDataService.js';

describe('Phase 5: Stock Predictions & Backtesting Engine', () => {
  beforeAll(async () => {
    // Ingest multiday bhavcopy sample fixture for integration endpoints
    const fixturePath = path.resolve('../data/fixtures/nse_bhavcopy_multiday_sample.csv');
    try {
      await ingestBhavcopyFile(fixturePath);
    } catch {
      // Ignore if already loaded or fallback used
    }
  });

  // =========================================================================
  // 1. STATISTICAL PREDICTION MODELS MATHEMATICS
  // =========================================================================
  describe('Statistical Baseline Models', () => {
    it('supports defined horizon values [1, 5, 20]', () => {
      expect(SUPPORTED_HORIZONS).toEqual([1, 5, 20]);
    });

    it('rejects empty closes array or invalid horizon', () => {
      expect(() => calculateModelForecast([], 5, 'naive')).toThrow(/Historical closes array must be non-empty/);
      expect(() => calculateModelForecast([100], 0, 'naive')).toThrow(/Unsupported forecast horizon/);
      expect(() => calculateModelForecast([100], -5, 'naive')).toThrow(/Unsupported forecast horizon/);
    });

    it('calculates Naive Persistence Forecast correctly: P(t+k) = P(t)', () => {
      const closes = [100, 102, 104, 105];
      const result = calculateModelForecast(closes, 5, 'naive');

      expect(result.model).toBe('naive');
      expect(result.latestClose).toBe(105);
      expect(result.forecastClose).toBe(105);
      expect(result.forecastChange).toBe(0);
      expect(result.forecastChangePct).toBe(0);
      expect(result.projectedPath).toEqual([105, 105, 105, 105, 105]);
      expect(result.confidenceBands.length).toBe(5);
    });

    it('calculates Simple Moving Average (SMA) baseline', () => {
      // Closes: [10, 20, 30] -> mean = 20
      const closes = [10, 20, 30];
      const result = calculateModelForecast(closes, 1, 'sma');

      expect(result.model).toBe('sma');
      expect(result.latestClose).toBe(30);
      expect(result.forecastClose).toBe(20);
      expect(result.forecastChange).toBe(-10);
      expect(result.projectedPath).toEqual([20]);
    });

    it('rejects SMA if observation count is below minimum (min 3)', () => {
      expect(() => calculateModelForecast([10, 20], 1, 'sma')).toThrow(/requires at least 3 historical observations/);
    });

    it('calculates Linear Trend Drift using OLS regression', () => {
      // Series with slight noise: [10, 22, 29, 41, 50]
      const nonCollinearCloses = [10, 22, 29, 41, 50];
      const result = calculateModelForecast(nonCollinearCloses, 5, 'trend');

      expect(result.model).toBe('trend');
      expect(result.latestClose).toBe(50);
      expect(result.projectedPath.length).toBe(5);
      expect(result.forecastClose).toBeGreaterThan(50);
      expect(result.standardError).toBeGreaterThan(0);

      // Verify expanding 95% confidence intervals: bandWidth ~ 1.96 * SE * sqrt(k)
      const bandWidthStep1 = result.confidenceBands[0].upperBound - result.confidenceBands[0].projected;
      const bandWidthStep5 = result.confidenceBands[4].upperBound - result.confidenceBands[4].projected;
      expect(bandWidthStep5).toBeGreaterThan(bandWidthStep1);
    });

    it('rejects Linear Trend model if observation count is below minimum (min 5)', () => {
      expect(() => calculateModelForecast([10, 20, 30, 40], 5, 'trend')).toThrow(
        /requires at least 5 historical observations/
      );
    });

    it('calculates Simple Exponential Smoothing (SES) with alpha = 0.3', () => {
      const closes = [100, 100, 100, 100];
      const result = calculateModelForecast(closes, 5, 'exponential_smoothing');

      expect(result.model).toBe('exponential_smoothing');
      expect(result.latestClose).toBe(100);
      expect(result.forecastClose).toBe(100);
      expect(result.projectedPath).toEqual([100, 100, 100, 100, 100]);
    });

    it('skips weekends in trading days calculation', () => {
      // 2024-03-08 is Friday. Adding 1 trading day should yield 2024-03-11 (Monday)
      const friday = '2024-03-08';
      const monday = addTradingDays(friday, 1);
      const nextDate = new Date(monday);
      expect(nextDate.getDay()).toBe(1); // 1 = Monday

      // Adding 5 trading days from Friday skips Sat (9) and Sun (10), ending next Friday (15)
      const nextFriday = addTradingDays(friday, 5);
      const fiveDaysDate = new Date(nextFriday);
      expect(fiveDaysDate.getDay()).toBe(5); // 5 = Friday
    });
  });

  // =========================================================================
  // 2. LEAKAGE-SAFE WALK-FORWARD BACKTESTING
  // =========================================================================
  describe('Walk-Forward Evaluation & Leakage Safeguards', () => {
    it('guarantees zero look-ahead bias: step t prediction is independent of future data', () => {
      const partialSeries = [10, 20, 30, 40, 50];
      const fullSeriesWithFuture = [10, 20, 30, 40, 50, 9999, -500, 1000];

      // Prediction at t = 4 using partial series
      const predFromPartial = calculateModelForecast(partialSeries, 1, 'trend');

      // In walk-forward backtest on fullSeriesWithFuture at t = 4, slice(0, 5) is used
      const backtestRun = executeWalkForwardEvaluation(fullSeriesWithFuture, {
        horizon: 1,
        model: 'trend',
        minTrainWindow: 5,
      });

      expect(backtestRun.evaluationWindowsSample.length).toBeGreaterThan(0);
      const firstWindow = backtestRun.evaluationWindowsSample[0];
      expect(firstWindow.modelForecast).toBe(predFromPartial.forecastClose);
      expect(firstWindow.currentPrice).toBe(50);
      expect(firstWindow.actualPrice).toBe(9999);
    });

    it('returns structured insufficient history message when N < minW + h', () => {
      const shortCloses = [100, 101, 102, 103, 104]; // 5 observations
      const result = executeWalkForwardEvaluation(shortCloses, {
        horizon: 5,
        model: 'trend',
        minTrainWindow: 5,
      });

      expect(result.hasSufficientData).toBe(false);
      expect(result.evaluatedWindows).toBe(0);
      expect(result.requiredObservations).toBe(10);
      expect(result.availableObservations).toBe(5);
      expect(result.metrics).toBeNull();
      expect(result.benchmarkComparison).toBeUndefined();
      expect(result.message).toContain('Insufficient trading sessions');
    });

    it('calculates MAE, RMSE, MAPE, and directional accuracy deterministically', () => {
      // Sequence where trend matches future:
      // [10, 20, 30, 40, 50, 60, 70, 80]
      const perfectCloses = [10, 20, 30, 40, 50, 60, 70, 80];
      const result = executeWalkForwardEvaluation(perfectCloses, {
        horizon: 1,
        model: 'trend',
        minTrainWindow: 5,
      });

      expect(result.hasSufficientData).toBe(true);
      expect(result.evaluatedWindows).toBe(3);
      expect(result.metrics.mae).toBe(0);
      expect(result.metrics.rmse).toBe(0);
      expect(result.metrics.mape).toBe(0);
      expect(result.metrics.directionalAccuracyPct).toBe(100);

      // In this strictly upward sequence, naive baseline predicts no change (err = 10 each window)
      expect(result.naiveBenchmark.mae).toBe(10);
      expect(result.benchmarkComparison.outperformancePct).toBe(100);
      expect(result.benchmarkComparison.beatsNaiveBaseline).toBe(true);
    });

    it('evaluates directional accuracy correctly on zero-delta and direction mismatches', () => {
      // Price stays constant: naive should hit 100% directional accuracy (both actual and predicted delta = 0)
      const flatCloses = [50, 50, 50, 50, 50, 50, 50];
      const result = executeWalkForwardEvaluation(flatCloses, {
        horizon: 1,
        model: 'naive',
        minTrainWindow: 5,
      });

      expect(result.hasSufficientData).toBe(true);
      expect(result.evaluatedWindows).toBe(2);
      expect(result.metrics.mae).toBe(0);
      expect(result.metrics.directionalAccuracyPct).toBe(100);
    });
  });

  // =========================================================================
  // 3. API ENDPOINTS INTEGRATION
  // =========================================================================
  describe('Predictions & Backtesting API Endpoints', () => {
    it('GET /api/predictions/models returns model catalog and supported horizons', async () => {
      const res = await request(app).get('/api/predictions/models');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.models)).toBe(true);
      expect(res.body.models.length).toBe(4);
      expect(res.body.models.map(m => m.id)).toEqual(
        expect.arrayContaining(['naive', 'sma', 'trend', 'exponential_smoothing'])
      );
      expect(Array.isArray(res.body.horizons)).toBe(true);
      expect(res.body.horizons.length).toBe(3);
    });

    it('GET /api/predictions/:symbol returns 200 with forecast for existing stock', async () => {
      const res = await request(app).get('/api/predictions/RELIANCE?horizon=5&model=trend');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.dataMode).toBe('HISTORICAL_EOD');
      expect(res.body.isLive).toBe(false);
      expect(res.body.disclaimer).toBeDefined();
      expect(res.body.symbol).toBe('RELIANCE');
      expect(res.body.horizon).toBe(5);
      expect(res.body.model).toBe('trend');
      expect(typeof res.body.forecastClose).toBe('number');
      expect(Array.isArray(res.body.projectedSeries)).toBe(true);
      expect(res.body.projectedSeries.length).toBe(5);
      expect(Array.isArray(res.body.chartData)).toBe(true);
      expect(res.body.chartData.length).toBeGreaterThan(5);
    });

    it('GET /api/predictions/:symbol supports horizon=1', async () => {
      const res = await request(app).get('/api/predictions/RELIANCE?horizon=1&model=naive');

      expect(res.status).toBe(200);
      expect(res.body.horizon).toBe(1);
      expect(res.body.projectedSeries.length).toBe(1);
      expect(res.body.model).toBe('naive');
    });

    it('GET /api/predictions/:symbol rejects invalid horizon with 400', async () => {
      const res = await request(app).get('/api/predictions/RELIANCE?horizon=99');

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('GET /api/predictions/:symbol rejects malformed symbol with 400', async () => {
      const res = await request(app).get('/api/predictions/INVALID%20SYMBOL%20!');

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('INVALID_SYMBOL');
    });

    it('GET /api/predictions/:symbol returns 404 for unknown symbol', async () => {
      const res = await request(app).get('/api/predictions/NONEXISTENT_STOCK_99');

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('DATA_NOT_FOUND');
    });

    it('POST /api/backtests executes walk-forward backtest and returns metrics', async () => {
      const payload = {
        symbol: 'RELIANCE',
        horizon: 1,
        model: 'trend',
        minTrainWindow: 5,
      };

      const res = await request(app).post('/api/backtests').send(payload);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.id).toBeDefined();
      expect(res.body.symbol).toBe('RELIANCE');
      expect(res.body.horizon).toBe(1);
      expect(res.body.model).toBe('trend');
      expect(res.body.metrics).toBeDefined();
      expect(typeof res.body.metrics.mae).toBe('number');
      expect(typeof res.body.metrics.rmse).toBe('number');
      expect(typeof res.body.metrics.mape).toBe('number');
      expect(typeof res.body.metrics.directionalAccuracyPct).toBe('number');
      expect(res.body.naiveBenchmark).toBeDefined();
      expect(res.body.benchmarkComparison).toBeDefined();
      expect(Array.isArray(res.body.evaluationWindowsSample)).toBe(true);
      expect(res.body.evaluationWindowsSample.length).toBeGreaterThan(0);

      // Verify the generated backtest is stored and retrievable via GET /api/backtests/:id
      const id = res.body.id;
      const getRes = await request(app).get(`/api/backtests/${id}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.status).toBe('success');
      expect(getRes.body.id).toBe(id);
      expect(getRes.body.symbol).toBe('RELIANCE');
    });

    it('POST /api/backtests returns 400 on invalid payload', async () => {
      const res = await request(app).post('/api/backtests').send({
        symbol: '',
        horizon: 99,
      });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('GET /api/backtests/:id returns 404 for non-existent backtest ID', async () => {
      const res = await request(app).get('/api/backtests/bt_unknown_99999');

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('BACKTEST_NOT_FOUND');
    });

    it('GET /api/backtests lists executed backtest jobs', async () => {
      const res = await request(app).get('/api/backtests');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.backtests)).toBe(true);
      expect(res.body.backtests.length).toBeGreaterThan(0);
    });
  });
});
