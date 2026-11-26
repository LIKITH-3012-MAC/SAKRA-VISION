import { logger } from '../utils/logger.js';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found Middleware
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    status: 'error',
    code: 'ROUTE_NOT_FOUND',
    message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist on SAKRA VISION server.`,
  });
}

/**
 * Centralized Global Error Handler
 */
export function errorHandler(err, req, res, next) {
  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));

    logger.warn('Request validation failed', {
      path: req.path,
      method: req.method,
      errors: formattedErrors,
    });

    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Request payload validation failed.',
      errors: formattedErrors,
    });
  }

  // 2. Malformed JSON Body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      code: 'INVALID_JSON',
      message: 'Malformed JSON payload provided in request body.',
    });
  }

  // 3. Known Application Errors (AppError)
  if (err.statusCode && err.statusCode !== 500) {
    return res.status(err.statusCode).json({
      status: 'error',
      code: err.code || 'REQUEST_FAILED',
      message: err.message,
      details: err.details || undefined,
    });
  }

  // 4. Database Errors (MySQL)
  if (err.code && typeof err.code === 'string' && (err.code.startsWith('ER_') || err.code.startsWith('PROTOCOL_'))) {
    logger.error('MySQL database error caught', {
      code: err.code,
      message: err.message,
      path: req.path,
    });

    return res.status(503).json({
      status: 'error',
      code: 'DATABASE_ERROR',
      message: 'A database query failure occurred. SAKRA VISION is running in resilient fallback mode.',
    });
  }

  // 5. Unhandled Server Errors (500)
  logger.error('Unhandled internal server error', {
    path: req.path,
    method: req.method,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  return res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected internal error occurred on the SAKRA intelligence server.',
  });
}
