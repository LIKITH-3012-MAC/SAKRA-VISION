import { Router } from 'express';
import { z } from 'zod';
import { runStockScreener } from '../services/analyticsService.js';

const router = Router();

const screenerQuerySchema = z.object({
  search: z.string().optional().default(''),
  q: z.string().optional(), // alias
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minChangePct: z.coerce.number().optional(),
  maxChangePct: z.coerce.number().optional(),
  minVolume: z.coerce.number().min(0).optional(),
  sortBy: z.enum(['price', 'changePct', 'volume', 'symbol', 'name', 'turnover', 'tradeDate']).default('volume'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * GET /api/screener
 * Multi-factor stock screener derived from verified historical EOD Bhavcopy records
 */
router.get('/', async (req, res, next) => {
  try {
    const validated = screenerQuerySchema.parse(req.query);
    const searchTerm = validated.search || validated.q || '';

    // Validate minPrice <= maxPrice if both supplied
    if (validated.minPrice !== undefined && validated.maxPrice !== undefined && validated.minPrice > validated.maxPrice) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_PRICE_RANGE',
        message: 'Parameter "minPrice" cannot exceed "maxPrice".',
      });
    }

    // Validate minChangePct <= maxChangePct if both supplied
    if (validated.minChangePct !== undefined && validated.maxChangePct !== undefined && validated.minChangePct > validated.maxChangePct) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_CHANGE_PCT_RANGE',
        message: 'Parameter "minChangePct" cannot exceed "maxChangePct".',
      });
    }

    const result = await runStockScreener({
      search: searchTerm,
      minPrice: validated.minPrice,
      maxPrice: validated.maxPrice,
      minChangePct: validated.minChangePct,
      maxChangePct: validated.maxChangePct,
      minVolume: validated.minVolume,
      sortBy: validated.sortBy,
      sortOrder: validated.sortOrder.toLowerCase(),
      page: validated.page,
      limit: validated.limit,
    });

    res.status(200).json({
      status: 'success',
      dataMode: 'HISTORICAL_EOD',
      isLive: false,
      source: 'NSE & BSE Historical Bhavcopy (tejhq/indian-markets)',
      disclaimer: 'Calculated from official historical end-of-day trading sessions. Not a live intraday feed.',
      data: result.data,
      pagination: result.pagination,
      appliedFilters: result.appliedFilters,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
