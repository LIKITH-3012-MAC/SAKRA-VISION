import { Router } from 'express';
import { z } from 'zod';
import { watchlistService } from '../services/watchlistService.js';

const router = Router();

const AUTH_LOCAL_DEV_HEADER = {
  authMode: 'LOCAL_DEVELOPMENT_ONLY',
  isMultiUserAuthenticated: false,
  notice: 'Running in single-tenant local-development mode. Production deployment requires user session authentication.',
};

const createWatchlistSchema = z.object({
  name: z.string().min(1, 'Watchlist name is required').max(100),
  description: z.string().max(255).optional(),
});

const addItemSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(30).regex(/^[A-Za-z0-9_&-]+$/, 'Invalid stock symbol format'),
  notes: z.string().optional().default(''),
});

/**
 * GET /api/watchlists
 * List all watchlists or default primary watchlist
 */
router.get('/', async (req, res, next) => {
  try {
    const watchlists = await watchlistService.listWatchlists();
    res.status(200).json({
      status: 'success',
      ...AUTH_LOCAL_DEV_HEADER,
      count: watchlists.length,
      watchlists,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/watchlists
 * Create a new watchlist
 */
router.post('/', async (req, res, next) => {
  try {
    const validated = createWatchlistSchema.parse(req.body);
    const created = await watchlistService.createWatchlist(validated);

    res.status(201).json({
      status: 'success',
      ...AUTH_LOCAL_DEV_HEADER,
      watchlist: created,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Invalid watchlist creation payload',
        errors: err.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
      });
    }
    next(err);
  }
});

/**
 * GET /api/watchlists/:id
 * Retrieve specific watchlist with enriched market quotes
 */
router.get('/:id', async (req, res, next) => {
  try {
    const result = await watchlistService.getWatchlistById(req.params.id);

    if (!result) {
      return res.status(404).json({
        status: 'error',
        code: 'WATCHLIST_NOT_FOUND',
        message: `Watchlist with ID "${req.params.id}" was not found.`,
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
 * POST /api/watchlists/:id/items
 * Add a stock to watchlist with duplicate prevention
 */
router.post('/:id/items', async (req, res, next) => {
  try {
    const validated = addItemSchema.parse(req.body);
    const item = await watchlistService.addWatchlistItem(req.params.id, {
      symbol: validated.symbol,
      notes: validated.notes,
    });

    res.status(201).json({
      status: 'success',
      message: `${item.symbol} added to watchlist successfully.`,
      item,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Invalid stock item parameters',
        errors: err.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
      });
    }
    if (err.code === 'DUPLICATE_WATCHLIST_ITEM') {
      return res.status(409).json({
        status: 'error',
        code: 'DUPLICATE_ITEM',
        message: err.message,
      });
    }
    next(err);
  }
});

/**
 * DELETE /api/watchlists/:id/items/:itemId
 * Remove a stock from watchlist (accepts item ID or symbol)
 */
router.delete('/:id/items/:itemId', async (req, res, next) => {
  try {
    const result = await watchlistService.removeWatchlistItem(req.params.id, req.params.itemId);

    res.status(200).json({
      status: 'success',
      message: `${result.symbol} removed from watchlist.`,
      ...result,
    });
  } catch (err) {
    if (err.code === 'WATCHLIST_ITEM_NOT_FOUND') {
      return res.status(404).json({
        status: 'error',
        code: 'ITEM_NOT_FOUND',
        message: err.message,
      });
    }
    next(err);
  }
});

export default router;
