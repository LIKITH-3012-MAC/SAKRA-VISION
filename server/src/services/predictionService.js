import { queryHistoricalPrices } from './historicalDataService.js';
import { logger } from '../utils/logger.js';

export const SUPPORTED_MODELS = {
  naive: {
    id: 'naive',
    name: 'Naive Persistence Baseline',
    description: 'Projects the most recent observed closing price forward flatly across the horizon: P(t+k) = P(t). Serves as the fundamental no-arbitrage benchmark.',
    minObservations: 1,
  },
  sma: {
    id: 'sma',
    name: 'Simple Moving Average (SMA)',
    description: 'Calculates the rolling arithmetic mean of observed closing prices over an adaptive window (up to 20 sessions) and projects it forward.',
    minObservations: 3,
  },
  trend: {
    id: 'trend',
    name: 'Ordinary Least Squares Linear Drift',
    description: 'Estimates linear slope and intercept over recent trading sessions using Ordinary Least Squares regression: P(t+k) = alpha + beta * (w - 1 + k).',
    minObservations: 5,
  },
  exponential_smoothing: {
    id: 'exponential_smoothing',
    name: 'Simple Exponential Smoothing (SES)',
    description: 'Applies recursive exponential weighting (alpha = 0.3) to historical closes, giving geometrically decreasing weight to older observations.',
    minObservations: 3,
  },
};

export const SUPPORTED_HORIZONS = [1, 5, 20];

/**
 * Predict next h steps using pure mathematical models
 * @param {number[]} closes - Historical closing prices in strict chronological order
 * @param {number} horizon - Forecast horizon: 1, 5, or 20
 * @param {string} modelType - 'naive' | 'sma' | 'trend' | 'exponential_smoothing'
 * @returns {object} { projectedPath: number[], forecastClose: number, forecastChange: number, forecastChangePct: number, standardError: number, confidenceInterval: object }
 */
export function calculateModelForecast(closes, horizon = 5, modelType = 'trend') {
  if (!Array.isArray(closes) || closes.length === 0) {
    throw new Error('Historical closes array must be non-empty.');
  }

  const h = Number(horizon);
  if (!SUPPORTED_HORIZONS.includes(h) && h <= 0) {
    throw new Error(`Unsupported forecast horizon: ${horizon}. Must be 1, 5, or 20 trading sessions.`);
  }

  const N = closes.length;
  const latestClose = closes[N - 1];
  const modelKey = SUPPORTED_MODELS[modelType] ? modelType : 'trend';
  const modelDef = SUPPORTED_MODELS[modelKey];

  if (N < modelDef.minObservations) {
    throw new Error(`Model "${modelDef.name}" requires at least ${modelDef.minObservations} historical observations (provided: ${N}).`);
  }

  const projectedPath = [];
  let inSampleResiduals = [];

  switch (modelKey) {
    case 'naive': {
      // P(t+k) = P(t) for all k
      for (let k = 1; k <= h; k++) {
        projectedPath.push(latestClose);
      }
      // In-sample one-step errors: P(i) - P(i-1)
      for (let i = 1; i < N; i++) {
        inSampleResiduals.push(closes[i] - closes[i - 1]);
      }
      break;
    }

    case 'sma': {
      // Window is up to 20 or available observations
      const windowSize = Math.min(20, N);
      const slice = closes.slice(N - windowSize);
      const smaVal = Number((slice.reduce((acc, cur) => acc + cur, 0) / windowSize).toFixed(2));
      for (let k = 1; k <= h; k++) {
        projectedPath.push(smaVal);
      }
      // In-sample residuals over rolling window
      for (let i = windowSize; i < N; i++) {
        const wSlice = closes.slice(i - windowSize, i);
        const wMean = wSlice.reduce((acc, cur) => acc + cur, 0) / windowSize;
        inSampleResiduals.push(closes[i] - wMean);
      }
      break;
    }

    case 'trend': {
      // Linear regression on recent window (up to 20 observations)
      const windowSize = Math.min(20, N);
      const slice = closes.slice(N - windowSize);
      const xMean = (windowSize - 1) / 2;
      const yMean = slice.reduce((a, b) => a + b, 0) / windowSize;

      let numerator = 0;
      let denominator = 0;
      for (let i = 0; i < windowSize; i++) {
        const xDiff = i - xMean;
        numerator += xDiff * (slice[i] - yMean);
        denominator += xDiff * xDiff;
      }

      const slope = denominator !== 0 ? numerator / denominator : 0;
      const intercept = yMean - slope * xMean;

      for (let k = 1; k <= h; k++) {
        const targetX = windowSize - 1 + k;
        const projected = Math.max(0.01, Number((intercept + slope * targetX).toFixed(2)));
        projectedPath.push(projected);
      }

      // In-sample residuals of the fitted trend
      for (let i = 0; i < windowSize; i++) {
        const fitted = intercept + slope * i;
        inSampleResiduals.push(slice[i] - fitted);
      }
      break;
    }

    case 'exponential_smoothing': {
      const alpha = 0.3;
      let s = closes[0];
      const smoothedSeries = [s];

      for (let i = 1; i < N; i++) {
        s = alpha * closes[i] + (1 - alpha) * s;
        smoothedSeries.push(s);
      }

      const finalSmoothed = Number(s.toFixed(2));
      for (let k = 1; k <= h; k++) {
        projectedPath.push(finalSmoothed);
      }

      // One-step ahead in-sample errors
      for (let i = 1; i < N; i++) {
        inSampleResiduals.push(closes[i] - smoothedSeries[i - 1]);
      }
      break;
    }
  }

  // Calculate Standard Error of residuals for confidence band
  let standardError = 0;
  if (inSampleResiduals.length > 1) {
    const sumSq = inSampleResiduals.reduce((acc, r) => acc + r * r, 0);
    standardError = Number(Math.sqrt(sumSq / (inSampleResiduals.length - 1)).toFixed(2));
  } else {
    standardError = Number((latestClose * 0.02).toFixed(2)); // 2% baseline fallback
  }

  const forecastClose = projectedPath[h - 1];
  const forecastChange = Number((forecastClose - latestClose).toFixed(2));
  const forecastChangePct = latestClose > 0
    ? Number(((forecastChange / latestClose) * 100).toFixed(2))
    : 0;

  // Build stepwise confidence interval: expands with sqrt(k)
  const confidenceBands = projectedPath.map((pVal, idx) => {
    const k = idx + 1;
    const bandWidth = Number((1.96 * standardError * Math.sqrt(k)).toFixed(2));
    return {
      step: k,
      projected: pVal,
      lowerBound: Math.max(0.01, Number((pVal - bandWidth).toFixed(2))),
      upperBound: Number((pVal + bandWidth).toFixed(2)),
    };
  });

  return {
    model: modelKey,
    modelName: modelDef.name,
    horizon: h,
    latestClose,
    forecastClose,
    forecastChange,
    forecastChangePct,
    standardError,
    projectedPath,
    confidenceBands,
  };
}

/**
 * Advance a date string by k business/trading days (Monday-Friday, skipping weekends)
 */
export function addTradingDays(dateStr, days) {
  let date = new Date(dateStr);
  if (isNaN(date.getTime())) date = new Date();

  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) { // Skip Sunday (0) and Saturday (6)
      added++;
    }
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export class PredictionService {
  /**
   * Generate stock forecast from verified historical EOD database records
   */
  async generateStockPrediction(symbol, { horizon = 5, model = 'trend' } = {}) {
    const sym = String(symbol || 'RELIANCE').trim().toUpperCase();
    const h = Number(horizon) || 5;
    const modelKey = SUPPORTED_MODELS[model] ? model : 'trend';

    // 1. Fetch chronological historical prices
    const records = await queryHistoricalPrices(sym, { limit: 500 });

    if (!records || records.length === 0) {
      return {
        hasData: false,
        symbol: sym,
        message: `No verified historical trading records found for symbol ${sym}.`,
        prediction: null,
      };
    }

    // Sort strictly chronological ascending
    records.sort((a, b) => a.tradeDate.localeCompare(b.tradeDate));

    const closes = records.map(r => r.close);
    const count = closes.length;
    const latestRecord = records[count - 1];
    const firstRecord = records[0];

    const modelDef = SUPPORTED_MODELS[modelKey];
    if (count < modelDef.minObservations) {
      return {
        hasData: false,
        symbol: sym,
        message: `Insufficient trading sessions for ${modelDef.name}. Required: ${modelDef.minObservations}, Available: ${count}.`,
        prediction: null,
      };
    }

    // 2. Compute forecast
    const forecast = calculateModelForecast(closes, h, modelKey);

    // 3. Construct chronological combined chart series (historical + projected)
    const historicalPoints = records.map((r) => ({
      date: r.tradeDate.slice(5),
      fullDate: r.tradeDate,
      close: r.close,
      isForecast: false,
    }));

    // Generate projected future trading dates
    const latestDate = latestRecord.tradeDate;
    const projectedPoints = forecast.confidenceBands.map((band) => {
      const projDate = addTradingDays(latestDate, band.step);
      return {
        date: projDate.slice(5),
        fullDate: projDate,
        forecastClose: band.projected,
        lowerBound: band.lowerBound,
        upperBound: band.upperBound,
        isForecast: true,
        label: `T+${band.step}`,
      };
    });

    // Bridge point: Connect last historical point to first forecast point
    const bridgePoint = {
      date: latestDate.slice(5),
      fullDate: latestDate,
      close: latestRecord.close,
      forecastClose: latestRecord.close,
      lowerBound: latestRecord.close,
      upperBound: latestRecord.close,
      isForecast: false,
    };

    return {
      hasData: true,
      symbol: sym,
      companyName: latestRecord.companyName || `${sym} Limited`,
      isin: latestRecord.isin,
      series: latestRecord.series,
      model: modelKey,
      modelName: modelDef.name,
      modelDescription: modelDef.description,
      horizon: h,
      forecastClose: forecast.forecastClose,
      latestClose: forecast.latestClose,
      forecastChange: forecast.forecastChange,
      forecastChangePct: forecast.forecastChangePct,
      standardError: forecast.standardError,
      historicalObservationsCount: count,
      dataCoverage: {
        from: firstRecord.tradeDate,
        to: latestDate,
        tradingDays: count,
      },
      projectedSeries: projectedPoints,
      chartData: [...historicalPoints.slice(-30), ...projectedPoints], // Last 30 sessions + projected
      limitations: [
        'Statistical projections represent deterministic baselines, not guaranteed investment outcomes.',
        'Model estimates do not account for unannounced corporate disclosures, geopolitical events, or systemic liquidity shocks.',
        'Trading days are computed sequentially excluding Saturdays and Sundays.',
      ],
      generatedAt: new Date().toISOString(),
    };
  }
}

export const predictionService = new PredictionService();
