import { Router } from 'express';
import { z } from 'zod';
import { predictionService, SUPPORTED_MODELS, SUPPORTED_HORIZONS } from '../services/predictionService.js';
import { backtestService } from '../services/backtestService.js';

const router = Router();

const predictionQuerySchema = z.object({
  horizon: z.coerce.number().int().refine(val => SUPPORTED_HORIZONS.includes(val), {
    message: 'Horizon must be 1, 5, or 20 trading sessions.',
  }).default(5),
  model: z.enum(['naive', 'sma', 'trend', 'exponential_smoothing']).optional().default('trend'),
});

const backtestCreateSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(30).regex(/^[A-Za-z0-9_&-]+$/, 'Invalid symbol format'),
  horizon: z.coerce.number().int().refine(val => SUPPORTED_HORIZONS.includes(val), {
    message: 'Horizon must be 1, 5, or 20 trading sessions.',
  }).default(5),
  model: z.enum(['naive', 'sma', 'trend', 'exponential_smoothing']).optional().default('trend'),
  minTrainWindow: z.coerce.number().int().min(5).max(50).optional().default(5),
});

/**
 * GET /api/predictions/models
 * Returns available statistical prediction models and horizon options
 */
router.get('/models', (req, res) => {
  res.status(200).json({
    status: 'success',
    models: Object.values(SUPPORTED_MODELS),
    horizons: SUPPORTED_HORIZONS.map(h => ({
      value: h,
      label: h === 1 ? '1 Session (Next Day)' : h === 5 ? '5 Sessions (1 Week)' : '20 Sessions (1 Month)',
    })),
  });
});

/**
 * GET /api/predictions/:symbol?horizon=1|5|20&model=naive|sma|trend|exponential_smoothing
 * Generates transparent statistical baseline forecast from historical EOD records
 */
router.get('/:symbol', async (req, res, next) => {
  try {
    const rawSymbol = req.params.symbol;
    if (!rawSymbol || !/^[A-Za-z0-9_&-]{1,30}$/.test(rawSymbol.trim())) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_SYMBOL',
        message: 'Invalid stock symbol format. Alphanumeric up to 30 characters required.',
      });
    }

    const queryParams = predictionQuerySchema.parse(req.query);
    const result = await predictionService.generateStockPrediction(rawSymbol, {
      horizon: queryParams.horizon,
      model: queryParams.model,
    });

    if (!result.hasData) {
      return res.status(404).json({
        status: 'error',
        code: 'DATA_NOT_FOUND',
        symbol: rawSymbol.toUpperCase(),
        message: result.message,
      });
    }

    res.status(200).json({
      status: 'success',
      dataMode: 'HISTORICAL_EOD',
      isLive: false,
      disclaimer: 'Statistical baseline projection only. Not guaranteed future prices or personalized investment advice.',
      ...result,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Invalid prediction parameters',
        errors: err.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
      });
    }
    next(err);
  }
});

/**
 * POST /api/backtests
 * Executes leakage-safe walk-forward backtest over historical EOD records
 */
export const backtestRouter = Router();

backtestRouter.post('/', async (req, res, next) => {
  try {
    const validated = backtestCreateSchema.parse(req.body);
    const result = await backtestService.runBacktest({
      symbol: validated.symbol,
      horizon: validated.horizon,
      model: validated.model,
      minTrainWindow: validated.minTrainWindow,
    });

    if (!result.hasData) {
      return res.status(400).json({
        status: 'error',
        code: 'INSUFFICIENT_DATA',
        symbol: validated.symbol.toUpperCase(),
        message: result.message,
        availableObservations: result.availableObservations,
      });
    }

    res.status(200).json({
      status: 'success',
      dataMode: 'HISTORICAL_EOD',
      disclaimer: 'Walk-forward empirical backtest. Past backtest accuracy does not guarantee future results.',
      ...result,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Invalid backtest parameters',
        errors: err.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
      });
    }
    next(err);
  }
});

backtestRouter.get('/', (req, res) => {
  const recent = backtestService.listRecentBacktests(20);
  res.status(200).json({
    status: 'success',
    count: recent.length,
    backtests: recent,
  });
});

backtestRouter.get('/:id', (req, res) => {
  const result = backtestService.getBacktestById(req.params.id);
  if (!result) {
    return res.status(404).json({
      status: 'error',
      code: 'BACKTEST_NOT_FOUND',
      message: `Backtest job with ID ${req.params.id} was not found.`,
    });
  }

  res.status(200).json({
    status: 'success',
    ...result,
  });
});

export default router;
