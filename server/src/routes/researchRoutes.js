import { Router } from 'express';
import { z } from 'zod';
import { aiResearchService } from '../services/aiResearchService.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Zod Validation Schemas
const companyResearchSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(30).regex(/^[A-Za-z0-9_&-]+$/, 'Invalid symbol format'),
  task: z.enum(['comprehensive', 'overview', 'news', 'bull_bear', 'risks']).optional().default('comprehensive'),
  question: z.string().max(600).optional(),
});

const newsResearchSchema = z.object({
  query: z.string().max(300).optional().default(''),
  symbol: z.string().max(30).regex(/^[A-Za-z0-9_&-]*$/).optional().nullable(),
  limit: z.coerce.number().int().min(1).max(10).optional().default(5),
});

const analyzeResearchSchema = z.object({
  question: z.string().min(3, 'Question must be at least 3 characters').max(600, 'Question cannot exceed 600 characters'),
  symbol: z.string().max(30).regex(/^[A-Za-z0-9_&-]*$/).optional().nullable(),
  task: z.enum(['comprehensive', 'overview', 'news', 'bull_bear', 'risks']).optional().default('comprehensive'),
});

/**
 * GET /api/research/health (and /api/v1/research/health)
 * Reports connectivity and operational status of Groq AI, Firecrawl, and Market Data
 */
router.get('/health', async (req, res, next) => {
  try {
    const health = await aiResearchService.getHealth();
    res.status(200).json(health);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/research/company
 * Fundamental research synthesis on a specific equity security
 */
router.post('/company', async (req, res, next) => {
  try {
    const validated = companyResearchSchema.parse(req.body);
    const result = await aiResearchService.researchCompany({
      symbol: validated.symbol,
      task: validated.task,
      question: validated.question,
    });

    res.status(200).json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Invalid request parameters',
        errors: err.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
      });
    }
    next(err);
  }
});

/**
 * POST /api/research/news
 * Searches recent web news & disclosures via Firecrawl and generates intelligence summary
 */
router.post('/news', async (req, res, next) => {
  try {
    const validated = newsResearchSchema.parse(req.body);
    const result = await aiResearchService.researchNews({
      query: validated.query,
      symbol: validated.symbol,
      limit: validated.limit,
    });

    res.status(200).json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Invalid request parameters',
        errors: err.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
      });
    }
    next(err);
  }
});

/**
 * POST /api/research/analyze
 * Custom research question synthesis combining stored historical data and web intelligence
 */
router.post('/analyze', async (req, res, next) => {
  try {
    const validated = analyzeResearchSchema.parse(req.body);
    const result = await aiResearchService.analyzeResearchQuery({
      question: validated.question,
      symbol: validated.symbol,
      task: validated.task,
    });

    res.status(200).json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Invalid request parameters',
        errors: err.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
      });
    }
    next(err);
  }
});

export default router;
