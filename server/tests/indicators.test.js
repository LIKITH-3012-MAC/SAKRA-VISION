import { describe, it, expect } from 'vitest';
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateBollingerBands,
  calculateATR,
  calculateRelativeVolume,
} from '../src/utils/indicators.js';

describe('Technical Indicators Engine', () => {
  it('calculates SMA correctly with adequate lookback', () => {
    const prices = [10, 20, 30, 40, 50];
    const sma3 = calculateSMA(prices, 3);
    expect(sma3).toEqual([null, null, 20, 30, 40]);
  });

  it('handles empty or short input for SMA gracefully', () => {
    expect(calculateSMA([], 5)).toEqual([]);
    expect(calculateSMA([10, 20], 5)).toEqual([null, null]);
  });

  it('calculates EMA properly starting with initial SMA seed', () => {
    const prices = [10, 10, 10, 20, 20];
    const ema3 = calculateEMA(prices, 3);
    // Period 3: first valid value is index 2 = 10
    // Multiplier k = 2 / (3 + 1) = 0.5
    // Next val = 20 * 0.5 + 10 * 0.5 = 15.00
    expect(ema3[2]).toBe(10);
    expect(ema3[3]).toBe(15);
  });

  it('calculates RSI within the 0 to 100 boundaries', () => {
    // 15 prices (period 5)
    const closes = [100, 102, 101, 105, 107, 106, 108, 110, 109, 112, 115, 114, 113, 116, 118];
    const rsi = calculateRSI(closes, 5);
    const validValues = rsi.filter(v => v !== null);
    expect(validValues.length).toBeGreaterThan(0);
    validValues.forEach(val => {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(100);
    });
  });

  it('calculates Bollinger Bands with upper, middle, and lower bands', () => {
    const prices = [10, 12, 11, 13, 15, 14, 16];
    const bb = calculateBollingerBands(prices, 3);
    expect(bb.upper.length).toBe(prices.length);
    expect(bb.middle.length).toBe(prices.length);
    expect(bb.lower.length).toBe(prices.length);

    // Upper must be >= Middle >= Lower for non-nulls
    for (let i = 2; i < prices.length; i++) {
      expect(bb.upper[i]).toBeGreaterThanOrEqual(bb.middle[i]);
      expect(bb.middle[i]).toBeGreaterThanOrEqual(bb.lower[i]);
    }
  });

  it('calculates Average True Range correctly', () => {
    const candles = [
      { high: 105, low: 95, close: 100 },
      { high: 108, low: 98, close: 104 },
      { high: 106, low: 99, close: 101 },
      { high: 110, low: 102, close: 108 },
    ];
    const atr = calculateATR(candles, 2);
    expect(atr.length).toBe(candles.length);
    expect(atr[0]).toBeNull();
  });

  it('calculates relative volume relative to SMA volume', () => {
    const volumes = [1000, 1000, 2000];
    const rvol = calculateRelativeVolume(volumes, 2);
    expect(rvol[0]).toBeNull();
    expect(rvol[1]).toBe(1.0); // 1000 / avg(1000, 1000)
    expect(rvol[2]).toBe(1.33); // 2000 / avg(1000, 2000)
  });
});
