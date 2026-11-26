import { logger, redactSecrets } from '../utils/logger.js';

/**
 * Express middleware for structured HTTP request/response logging
 * Automatically sanitizes query parameters, headers, and request bodies.
 */
export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const statusCode = res.statusCode;

    // Redact sensitive headers
    const sanitizedHeaders = { ...req.headers };
    delete sanitizedHeaders.authorization;
    delete sanitizedHeaders.cookie;
    delete sanitizedHeaders['set-cookie'];

    const meta = {
      method: req.method,
      path: req.originalUrl || req.path,
      statusCode,
      durationMs,
      ip: req.ip || req.socket?.remoteAddress,
      query: redactSecrets(req.query),
    };

    if (statusCode >= 500) {
      logger.error(`HTTP ${req.method} ${req.path} -> ${statusCode} (${durationMs}ms)`, meta);
    } else if (statusCode >= 400) {
      logger.warn(`HTTP ${req.method} ${req.path} -> ${statusCode} (${durationMs}ms)`, meta);
    } else {
      // Don't flood logs with high-frequency health pings in production
      if (req.path === '/api/health' || req.path === '/api/v1/health') {
        return;
      }
      logger.info(`HTTP ${req.method} ${req.path} -> ${statusCode} (${durationMs}ms)`, meta);
    }
  });

  next();
}
