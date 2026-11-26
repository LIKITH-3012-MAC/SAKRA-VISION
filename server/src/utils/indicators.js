/**
 * SAKRA VISION — Technical Indicator Mathematical Engine
 * Pure JavaScript implementations with robust validation and missing data handling.
 */

/**
 * Simple Moving Average (SMA)
 * @param {number[]} prices
 * @param {number} period
 * @returns {number[]} Array of SMA values (null for first period-1 elements)
 */
export function calculateSMA(prices, period = 20) {
  if (!Array.isArray(prices) || prices.length < period || period <= 0) {
    return prices ? prices.map(() => null) : [];
  }

  const result = [];
  let sum = 0;

  for (let i = 0; i < prices.length; i++) {
    const val = Number(prices[i]);
    sum += isNaN(val) ? 0 : val;

    if (i >= period) {
      const prev = Number(prices[i - period]);
      sum -= isNaN(prev) ? 0 : prev;
    }

    if (i >= period - 1) {
      result.push(Number((sum / period).toFixed(2)));
    } else {
      result.push(null);
    }
  }

  return result;
}

/**
 * Exponential Moving Average (EMA)
 * @param {number[]} prices
 * @param {number} period
 * @returns {number[]} Array of EMA values
 */
export function calculateEMA(prices, period = 20) {
  if (!Array.isArray(prices) || prices.length < period || period <= 0) {
    return prices ? prices.map(() => null) : [];
  }

  const k = 2 / (period + 1);
  const result = [];

  // Start with SMA for the first period
  let initialSum = 0;
  for (let i = 0; i < period; i++) {
    initialSum += Number(prices[i]) || 0;
    if (i < period - 1) {
      result.push(null);
    }
  }

  let prevEMA = initialSum / period;
  result.push(Number(prevEMA.toFixed(2)));

  for (let i = period; i < prices.length; i++) {
    const current = Number(prices[i]) || 0;
    const currentEMA = current * k + prevEMA * (1 - k);
    result.push(Number(currentEMA.toFixed(2)));
    prevEMA = currentEMA;
  }

  return result;
}

/**
 * Relative Strength Index (RSI - Wilder's Smoothing)
 * @param {number[]} closes
 * @param {number} period
 * @returns {number[]}
 */
export function calculateRSI(closes, period = 14) {
  if (!Array.isArray(closes) || closes.length <= period || period <= 0) {
    return closes ? closes.map(() => null) : [];
  }

  const result = [];
  const gains = [];
  const losses = [];

  for (let i = 1; i < closes.length; i++) {
    const diff = Number(closes[i]) - Number(closes[i - 1]);
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? Math.abs(diff) : 0);
  }

  // Initial averages
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // First period elements have no RSI
  for (let i = 0; i < period; i++) {
    result.push(null);
  }

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
  result.push(Number(rsi.toFixed(2)));

  // Wilder's smoothing for subsequent periods
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
    result.push(Number(rsi.toFixed(2)));
  }

  return result;
}

/**
 * Moving Average Convergence Divergence (MACD)
 * @param {number[]} prices
 * @param {number} fastPeriod (default 12)
 * @param {number} slowPeriod (default 26)
 * @param {number} signalPeriod (default 9)
 */
export function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  if (!Array.isArray(prices) || prices.length < slowPeriod) {
    return { macdLine: [], signalLine: [], histogram: [] };
  }

  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);

  const macdLine = [];
  for (let i = 0; i < prices.length; i++) {
    if (fastEMA[i] === null || slowEMA[i] === null) {
      macdLine.push(null);
    } else {
      macdLine.push(Number((fastEMA[i] - slowEMA[i]).toFixed(2)));
    }
  }

  // Filter valid macdLine numbers for signal line EMA
  const validMacdStartIndex = macdLine.findIndex(v => v !== null);
  const validMacdValues = macdLine.slice(validMacdStartIndex);
  const signalEMA = calculateEMA(validMacdValues, signalPeriod);

  const signalLine = [];
  const histogram = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < validMacdStartIndex) {
      signalLine.push(null);
      histogram.push(null);
    } else {
      const sigVal = signalEMA[i - validMacdStartIndex];
      signalLine.push(sigVal);
      if (macdLine[i] !== null && sigVal !== null) {
        histogram.push(Number((macdLine[i] - sigVal).toFixed(2)));
      } else {
        histogram.push(null);
      }
    }
  }

  return { macdLine, signalLine, histogram };
}

/**
 * Bollinger Bands (Upper, Middle, Lower)
 * @param {number[]} prices
 * @param {number} period (default 20)
 * @param {number} stdDevMultiplier (default 2)
 */
export function calculateBollingerBands(prices, period = 20, stdDevMultiplier = 2) {
  const sma = calculateSMA(prices, period);
  const upper = [];
  const lower = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upper.push(null);
      lower.push(null);
      continue;
    }

    const slice = prices.slice(i - period + 1, i + 1);
    const mean = sma[i];
    const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    upper.push(Number((mean + stdDev * stdDevMultiplier).toFixed(2)));
    lower.push(Number((mean - stdDev * stdDevMultiplier).toFixed(2)));
  }

  return { upper, middle: sma, lower };
}

/**
 * Average True Range (ATR)
 * @param {{ high: number, low: number, close: number }[]} candles
 * @param {number} period
 */
export function calculateATR(candles, period = 14) {
  if (!Array.isArray(candles) || candles.length <= period) {
    return candles ? candles.map(() => null) : [];
  }

  const trueRanges = [];
  for (let i = 1; i < candles.length; i++) {
    const cur = candles[i];
    const prevClose = candles[i - 1].close;
    const tr = Math.max(
      cur.high - cur.low,
      Math.abs(cur.high - prevClose),
      Math.abs(cur.low - prevClose)
    );
    trueRanges.push(tr);
  }

  const result = [null]; // 1st element
  let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = 1; i < period; i++) {
    result.push(null);
  }
  result.push(Number(atr.toFixed(2)));

  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period;
    result.push(Number(atr.toFixed(2)));
  }

  return result;
}

/**
 * Relative Volume (RVOL)
 * Compares current volume to N-period volume SMA
 */
export function calculateRelativeVolume(volumes, period = 20) {
  const smaVol = calculateSMA(volumes, period);
  return volumes.map((vol, i) => {
    if (smaVol[i] === null || smaVol[i] === 0) return null;
    return Number((vol / smaVol[i]).toFixed(2));
  });
}
