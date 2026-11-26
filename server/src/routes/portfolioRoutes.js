import { Router } from 'express';
import { z } from 'zod';
import { portfolioService } from '../services/portfolioService.js';

const router = Router();

// Single-tenant local development authorization disclaimer
const AUTH_LOCAL_DEV_HEADER = {
  authMode: 'LOCAL_DEVELOPMENT_ONLY',
  isMultiUserAuthenticated: false,
  notice: 'Running in single-tenant local-development mode. Production deployment requires JWT/OAuth2 session authentication to partition private portfolios.',
};

const createPortfolioSchema = z.object({
  name: z.string().min(1, 'Portfolio name is required').max(100),
  description: z.string().max(255).optional(),
  currency: z.string().max(5).default('INR'),
});

const addHoldingSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(30).regex(/^[A-Za-z0-9_&-]+$/, 'Invalid stock symbol format'),
  quantity: z.coerce.number().positive('Quantity must be greater than zero'),
  averageBuyPrice: z.coerce.number().positive('Average buy price must be greater than zero').optional(),
  avgPrice: z.coerce.number().positive('Average buy price must be greater than zero').optional(),
  exchange: z.string().max(10).optional().default('NSE'),
  notes: z.string().optional().default(''),
}).refine(data => data.averageBuyPrice !== undefined || data.avgPrice !== undefined, {
  message: 'Either averageBuyPrice or avgPrice must be provided',
  path: ['averageBuyPrice'],
});

const updateHoldingSchema = z.object({
  quantity: z.coerce.number().positive('Quantity must be greater than zero').optional(),
  averageBuyPrice: z.coerce.number().positive('Average buy price must be greater than zero').optional(),
  avgPrice: z.coerce.number().positive('Average buy price must be greater than zero').optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/portfolio
 * Returns the primary/default portfolio with complete calculated valuation and summary
 */
router.get('/', async (req, res, next) => {
  try {
    const portfolioId = req.query.id || 'default';
    const result = await portfolioService.getPortfolioById(portfolioId);

    if (!result) {
      return res.status(404).json({
        status: 'error',
        code: 'PORTFOLIO_NOT_FOUND',
        message: `Portfolio with ID "${portfolioId}" was not found.`,
      });
    }

    res.status(200).json({
      status: 'success',
      ...AUTH_LOCAL_DEV_HEADER,
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/portfolio/list
 * Returns list of available portfolios
 */
router.get('/list', async (req, res, next) => {
  try {
    const portfolios = await portfolioService.listPortfolios();
    res.status(200).json({
      status: 'success',
      ...AUTH_LOCAL_DEV_HEADER,
      count: portfolios.length,
      portfolios,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/portfolio
 * Create a new portfolio
 */
router.post('/', async (req, res, next) => {
  try {
    const validated = createPortfolioSchema.parse(req.body);
    const created = await portfolioService.createPortfolio(validated);

    res.status(201).json({
      status: 'success',
      ...AUTH_LOCAL_DEV_HEADER,
      portfolio: created,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Invalid portfolio creation payload',
        errors: err.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
      });
    }
    next(err);
  }
});

/**
 * GET /api/portfolio/:id
 * Retrieve specific portfolio by ID with holdings and valuation
 */
router.get('/:id', async (req, res, next) => {
  try {
    const result = await portfolioService.getPortfolioById(req.params.id);

    if (!result) {
      return res.status(404).json({
        status: 'error',
        code: 'PORTFOLIO_NOT_FOUND',
        message: `Portfolio with ID "${req.params.id}" was not found.`,
      });
    }

    res.status(200).json({
      status: 'success',
      ...AUTH_LOCAL_DEV_HEADER,
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/portfolio/:id/holdings
 * Add a holding to specific portfolio
 */
router.post('/:id/holdings', async (req, res, next) => {
  try {
    const validated = addHoldingSchema.parse(req.body);
    const avgPrice = validated.averageBuyPrice ?? validated.avgPrice;

    const holding = await portfolioService.addHolding(req.params.id, {
      symbol: validated.symbol,
      quantity: validated.quantity,
      averageBuyPrice: avgPrice,
      exchange: validated.exchange,
      notes: validated.notes,
    });

    res.status(201).json({
      status: 'success',
      message: `Holding for ${holding.symbol} added successfully.`,
      holding,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Invalid holding parameters',
        errors: err.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
      });
    }
    if (err.code === 'DUPLICATE_HOLDING') {
      return res.status(409).json({
        status: 'error',
        code: 'DUPLICATE_HOLDING',
        message: err.message,
      });
    }
    next(err);
  }
});

/**
 * Backwards compatibility: POST /api/portfolio/holdings
 * Adds holding to default portfolio
 */
router.post('/holdings', async (req, res, next) => {
  try {
    const validated = addHoldingSchema.parse(req.body);
    const avgPrice = validated.averageBuyPrice ?? validated.avgPrice;

    const holding = await portfolioService.addHolding('default', {
      symbol: validated.symbol,
      quantity: validated.quantity,
      averageBuyPrice: avgPrice,
      exchange: validated.exchange,
      notes: validated.notes,
    });

    res.status(201).json({
      status: 'success',
      holding,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Invalid holding parameters',
        errors: err.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
      });
    }
    if (err.code === 'DUPLICATE_HOLDING') {
      return res.status(409).json({
        status: 'error',
        code: 'DUPLICATE_HOLDING',
        message: err.message,
      });
    }
    next(err);
  }
});

/**
 * PATCH /api/portfolio/:id/holdings/:holdingId
 * Update quantity, average buy price, or notes
 */
router.patch('/:id/holdings/:holdingId', async (req, res, next) => {
  try {
    const validated = updateHoldingSchema.parse(req.body);
    const avgPrice = validated.averageBuyPrice ?? validated.avgPrice;

    const updated = await portfolioService.updateHolding(req.params.id, req.params.holdingId, {
      quantity: validated.quantity,
      averageBuyPrice: avgPrice,
      notes: validated.notes,
    });

    res.status(200).json({
      status: 'success',
      message: `Holding ${updated.symbol} updated successfully.`,
      holding: updated,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Invalid holding update parameters',
        errors: err.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
      });
    }
    if (err.code === 'HOLDING_NOT_FOUND') {
      return res.status(404).json({
        status: 'error',
        code: 'HOLDING_NOT_FOUND',
        message: err.message,
      });
    }
    next(err);
  }
});

/**
 * DELETE /api/portfolio/:id/holdings/:holdingId
 * Remove a holding from portfolio
 */
router.delete('/:id/holdings/:holdingId', async (req, res, next) => {
  try {
    const result = await portfolioService.deleteHolding(req.params.id, req.params.holdingId);

    res.status(200).json({
      status: 'success',
      message: `Holding ${result.symbol} removed from portfolio.`,
      ...result,
    });
  } catch (err) {
    if (err.code === 'HOLDING_NOT_FOUND') {
      return res.status(404).json({
        status: 'error',
        code: 'HOLDING_NOT_FOUND',
        message: err.message,
      });
    }
    next(err);
  }
});

/**
 * Backwards compatibility: DELETE /api/portfolio/holdings/:id
 * Deletes holding from default portfolio
 */
router.delete('/holdings/:id', async (req, res, next) => {
  try {
    const result = await portfolioService.deleteHolding('default', req.params.id);

    res.status(200).json({
      status: 'success',
      message: `Holding removed`,
      ...result,
    });
  } catch (err) {
    if (err.code === 'HOLDING_NOT_FOUND') {
      return res.status(404).json({
        status: 'error',
        code: 'HOLDING_NOT_FOUND',
        message: err.message,
      });
    }
    next(err);
  }
});

export default router;
