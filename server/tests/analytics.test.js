import { describe, it, expect, beforeAll } from 'vitest';
import {
  mean,
  sampleStdDev,
  calculateSMA,
  calculateAnnualizedVolatility,
  calculateStockAnalytics,
} from '../src/services/analyticsService.js';
import { ingestBhavcopyFile } from '../src/services/historicalDataService.js';
import path from 'path';

describe('Market Analytics & Quantitative Indicator Engine', () => {
  describe('Mathematical Formulas', () => {
    it('calculates arithmetic mean correctly', () => {
      expect(mean([10, 20, 30])).toBe(20);
      expect(mean([])).toBe(0);
      expect(mean([100])).toBe(100);
    });

    it('calculates sample standard deviation with N-1 degrees of freedom', () => {
      // For [2, 4, 4, 4, 5, 5, 7, 9]: mean = 5, variance = 32/7 ≈ 4.5714, s ≈ 2.138
      const s = sampleStdDev([2, 4, 4, 4, 5, 5, 7, 9]);
      expect(Number(s.toFixed(3))).toBe(2.138);
      expect(sampleStdDev([10])).toBe(0); // < 2 observations
    });

    it('calculates Simple Moving Average (SMA) only when observations >= k', () => {
      const closes = [10, 11, 12, 13, 14]; // 5 observations
      expect(calculateSMA(closes, 3)).toBe(13); // mean(12, 13, 14) = 13
      expect(calculateSMA(closes, 5)).toBe(12); // mean(10..14) = 12
      expect(calculateSMA(closes, 20)).toBeNull(); // Insufficient observations
    });

    it('calculates annualized volatility using 252 trading days only when N >= 5', () => {
      const stableCloses = [100, 101, 102, 101, 103, 102];
      const vol = calculateAnnualizedVolatility(stableCloses);
      expect(vol).toBeDefined();
      expect(typeof vol).toBe('number');
      expect(vol).toBeGreaterThan(0);

      // Insufficient observations (< 5 closes)
      expect(calculateAnnualizedVolatility([100, 101, 102])).toBeNull();
    });
  });

  describe('Stock Analytics Execution', () => {
    beforeAll(async () => {
      const fixturePath = path.resolve('../data/fixtures/nse_bhavcopy_multiday_sample.csv');
      try {
        await ingestBhavcopyFile(fixturePath);
      } catch {}
    });

    it('calculates complete metrics bundle for RELIANCE over trading sessions', async () => {
      const analytics = await calculateStockAnalytics('RELIANCE');
      expect(analytics.hasData).toBe(true);
      expect(analytics.symbol).toBe('RELIANCE');
      expect(analytics.tradingDaysCount).toBeGreaterThanOrEqual(5);

      const m = analytics.metrics;
      expect(m.latestClose).toBeGreaterThan(0);
      expect(m.previousClose).toBeGreaterThan(0);
      expect(m.periodHigh).toBeGreaterThanOrEqual(m.periodLow);
      expect(typeof m.periodReturnPct).toBe('number');
      expect(m.averageVolume).toBeGreaterThan(0);
      expect(m.latestTradeDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(m.annualizedVolatilityPct).toBeGreaterThan(0);

      // Observations notes
      expect(analytics.observationsNotes).toBeDefined();
      expect(analytics.formulaDocumentation).toBeDefined();
    });

    it('handles symbol with no trading history gracefully', async () => {
      const res = await calculateStockAnalytics('NON_EXISTENT_TICKER');
      expect(res.hasData).toBe(false);
      expect(res.metrics).toBeNull();
      expect(res.message).toContain('No historical trading records found');
    });
  });
});
