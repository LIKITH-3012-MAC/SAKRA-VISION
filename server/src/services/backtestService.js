import crypto from 'crypto';
import { queryHistoricalPrices } from './historicalDataService.js';
import { calculateModelForecast, SUPPORTED_MODELS, SUPPORTED_HORIZONS } from './predictionService.js';
import { logger } from '../utils/logger.js';

// In-memory persistent cache for executed backtest jobs (bounded at 100 entries)
export const BACKTEST_STORE = new Map();
const MAX_BACKTEST_ENTRIES = 100;

/**
 * Execute a leakage-safe walk-forward backtest over a chronological series of closing prices
 * @param {number[]} closes - Full chronological close price sequence
 * @param {object} options - { horizon: 1|5|20, model: string, minTrainWindow: number, dates: string[] }
 * @returns {object} Aggregated metrics, naive comparison, and evaluation window details
 */
export function executeWalkForwardEvaluation(closes, { horizon = 5, model = 'trend', minTrainWindow = 5, dates = [] } = {}) {
  const h = Number(horizon);
  if (!SUPPORTED_HORIZONS.includes(h)) {
    throw new Error(`Unsupported forecast horizon: ${horizon}. Allowed: 1, 5, or 20.`);
  }

  const modelKey = SUPPORTED_MODELS[model] ? model : 'trend';
  const N = closes.length;
  const minW = Math.max(5, Number(minTrainWindow) || 5);

  if (N < minW + h) {
    return {
      hasSufficientData: false,
      evaluatedWindows: 0,
      requiredObservations: minW + h,
      availableObservations: N,
      message: `Insufficient trading sessions for horizon ${h}. Need at least ${minW + h} trading sessions (available: ${N}).`,
      metrics: null,
      naiveComparison: null,
    };
  }

  const modelErrors = [];
  const naiveErrors = [];
  const modelPctErrors = [];
  const naivePctErrors = [];
  let modelDirectionalHits = 0;
  let naiveDirectionalHits = 0;

  const windowHistory = [];

  // Walk forward from minW - 1 to N - 1 - h
  // Step t uses ONLY data slice 0...t (NO LOOK-AHEAD) to predict step t+h
  for (let t = minW - 1; t <= N - 1 - h; t++) {
    const trainSlice = closes.slice(0, t + 1);
    const currentPrice = closes[t];
    const actualPrice = closes[t + h];

    // Compute Model Forecast at step t using trainSlice ONLY
    const forecastResult = calculateModelForecast(trainSlice, h, modelKey);
    const predictedPrice = forecastResult.forecastClose;

    // Compute Naive Benchmark Forecast at step t (P(t+h) = P(t))
    const naivePredictedPrice = currentPrice;

    // Residuals
    const err = predictedPrice - actualPrice;
    const naiveErr = naivePredictedPrice - actualPrice;

    modelErrors.push(err);
    naiveErrors.push(naiveErr);

    // Percentage Errors (safe nonzero actual)
    if (actualPrice > 0) {
      modelPctErrors.push((Math.abs(err) / actualPrice) * 100);
      naivePctErrors.push((Math.abs(naiveErr) / actualPrice) * 100);
    }

    // Directional Accuracy: Did model predict the correct direction relative to current price?
    const actualDelta = actualPrice - currentPrice;
    const modelDelta = predictedPrice - currentPrice;
    const actualSign = Math.sign(actualDelta);
    const modelSign = Math.sign(modelDelta);

    let isDirectionCorrect = false;
    if (actualSign === 0 && modelSign === 0) {
      isDirectionCorrect = true;
    } else if (actualSign !== 0 && actualSign === modelSign) {
      isDirectionCorrect = true;
    }
    if (isDirectionCorrect) modelDirectionalHits++;

    // Naive model always predicts delta = 0
    if (actualSign === 0) naiveDirectionalHits++;

    // Record sample window detail (last 20 for preview)
    if (windowHistory.length < 25) {
      windowHistory.push({
        windowIndex: windowHistory.length + 1,
        trainEndDate: dates[t] || `Step ${t}`,
        evalDate: dates[t + h] || `Step ${t + h}`,
        currentPrice,
        actualPrice,
        modelForecast: predictedPrice,
        naiveForecast: naivePredictedPrice,
        modelError: Number(err.toFixed(2)),
        naiveError: Number(naiveErr.toFixed(2)),
        directionalHit: isDirectionCorrect,
      });
    }
  }

  const M = modelErrors.length;
  if (M === 0) {
    return {
      hasSufficientData: false,
      evaluatedWindows: 0,
      message: 'Zero evaluation windows could be formed.',
    };
  }

  // Aggregate Metrics
  const mae = Number((modelErrors.reduce((a, b) => a + Math.abs(b), 0) / M).toFixed(2));
  const rmse = Number(Math.sqrt(modelErrors.reduce((a, b) => a + b * b, 0) / M).toFixed(2));
  const mape = modelPctErrors.length > 0
    ? Number((modelPctErrors.reduce((a, b) => a + b, 0) / modelPctErrors.length).toFixed(2))
    : null;
  const directionalAccuracyPct = Number(((modelDirectionalHits / M) * 100).toFixed(2));

  // Naive Benchmark Metrics
  const naiveMae = Number((naiveErrors.reduce((a, b) => a + Math.abs(b), 0) / M).toFixed(2));
  const naiveRmse = Number(Math.sqrt(naiveErrors.reduce((a, b) => a + b * b, 0) / M).toFixed(2));
  const naiveMape = naivePctErrors.length > 0
    ? Number((naivePctErrors.reduce((a, b) => a + b, 0) / naivePctErrors.length).toFixed(2))
    : null;
  const naiveDirectionalAccuracyPct = Number(((naiveDirectionalHits / M) * 100).toFixed(2));

  // Comparison vs Naive Benchmark
  const outperformancePct = naiveRmse > 0
    ? Number((((naiveRmse - rmse) / naiveRmse) * 100).toFixed(2))
    : 0;
  const relativeRmse = naiveRmse > 0 ? Number((rmse / naiveRmse).toFixed(3)) : 1.0;

  return {
    hasSufficientData: true,
    evaluatedWindows: M,
    model: modelKey,
    modelName: SUPPORTED_MODELS[modelKey].name,
    horizon: h,
    metrics: {
      mae,
      rmse,
      mape,
      directionalAccuracyPct,
      totalEvaluations: M,
    },
    naiveBenchmark: {
      mae: naiveMae,
      rmse: naiveRmse,
      mape: naiveMape,
      directionalAccuracyPct: naiveDirectionalAccuracyPct,
    },
    benchmarkComparison: {
      relativeRmse,
      outperformancePct,
      beatsNaiveBaseline: rmse < naiveRmse,
      verdict: rmse < naiveRmse
        ? `Model outperformed naive baseline by ${outperformancePct}% RMSE.`
        : `Naive baseline had lower RMSE by ${Math.abs(outperformancePct)}%.`,
    },
    evaluationWindowsSample: windowHistory,
  };
}

export class BacktestService {
  /**
   * Run a backtest for a stock symbol over its historical database records
   */
  async runBacktest({ symbol, horizon = 5, model = 'trend', minTrainWindow = 5 } = {}) {
    const sym = String(symbol || 'RELIANCE').trim().toUpperCase();
    const h = Number(horizon) || 5;
    const modelKey = SUPPORTED_MODELS[model] ? model : 'trend';

    // 1. Fetch chronological historical data
    const records = await queryHistoricalPrices(sym, { limit: 500 });

    if (!records || records.length === 0) {
      return {
        hasData: false,
        symbol: sym,
        message: `No historical trading records found for symbol ${sym}.`,
      };
    }

    // Sort strictly chronological ascending
    records.sort((a, b) => a.tradeDate.localeCompare(b.tradeDate));

    const closes = records.map(r => r.close);
    const dates = records.map(r => r.tradeDate);
    const N = closes.length;

    // 2. Execute walk-forward evaluation
    const evaluation = executeWalkForwardEvaluation(closes, {
      horizon: h,
      model: modelKey,
      minTrainWindow,
      dates,
    });

    if (!evaluation.hasSufficientData) {
      return {
        hasData: false,
        symbol: sym,
        availableObservations: N,
        message: evaluation.message,
      };
    }

    const backtestId = `bt-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const resultPayload = {
      hasData: true,
      id: backtestId,
      symbol: sym,
      companyName: records[N - 1].companyName || `${sym} Limited`,
      isin: records[N - 1].isin,
      series: records[N - 1].series,
      horizon: h,
      model: modelKey,
      modelName: evaluation.modelName,
      dataCoverage: {
        from: dates[0],
        to: dates[N - 1],
        totalObservations: N,
        evaluatedWindows: evaluation.evaluatedWindows,
      },
      metrics: evaluation.metrics,
      naiveBenchmark: evaluation.naiveBenchmark,
      benchmarkComparison: evaluation.benchmarkComparison,
      evaluationWindowsSample: evaluation.evaluationWindowsSample,
      limitations: [
        'Walk-forward backtesting uses strictly expanding chronological windows with zero look-ahead bias.',
        'Historical accuracy does not guarantee future forecasting reliability.',
        'Unchanged prices are counted as correct only if model predicts zero change.',
      ],
      createdAt: new Date().toISOString(),
    };

    // Store in cache (evict oldest if full)
    if (BACKTEST_STORE.size >= MAX_BACKTEST_ENTRIES) {
      const oldestKey = BACKTEST_STORE.keys().next().value;
      BACKTEST_STORE.delete(oldestKey);
    }
    BACKTEST_STORE.set(backtestId, resultPayload);

    logger.info('[BacktestService] Executed backtest', { backtestId, symbol: sym, horizon: h, model: modelKey, rmse: evaluation.metrics.rmse });
    return resultPayload;
  }

  /**
   * Retrieve a previously executed backtest by ID
   */
  getBacktestById(id) {
    if (!id || !BACKTEST_STORE.has(id)) {
      return null;
    }
    return BACKTEST_STORE.get(id);
  }

  /**
   * List recent backtests
   */
  listRecentBacktests(limit = 10) {
    const list = Array.from(BACKTEST_STORE.values()).reverse();
    return list.slice(0, limit);
  }
}

export const backtestService = new BacktestService();
