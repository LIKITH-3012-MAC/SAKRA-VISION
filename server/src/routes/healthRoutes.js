import { Router } from 'express';
import { env } from '../config/env.js';
import { testConnection } from '../config/db.js';

const router = Router();
const startTime = Date.now();

/**
 * GET /api/health
 * Server health, uptime, environment, and operational status
 */
router.get('/health', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    status: 'ok',
    product: 'SAKRA VISION',
    tagline: 'ANALYZE · ANTICIPATE · ACCUMULATE',
    service: 'intelligence-api',
    version: '1.0.0',
    uptimeSeconds,
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    marketDataMode: env.MARKET_DATA_MODE,
    databaseConfig: {
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      user: env.DB_USER,
      sslEnabled: env.DB_SSL,
      caPathConfigured: Boolean(env.DB_SSL_CA_PATH),
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryRssMb: Math.round(memoryUsage.rss / (1024 * 1024)),
      heapUsedMb: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
    },
  });
});

/**
 * GET /api/health/db
 * Dedicated live database connectivity check with latency and SSL verification
 */
router.get('/health/db', async (req, res) => {
  try {
    const result = await testConnection();

    if (result.connected) {
      return res.status(200).json({
        status: 'ok',
        database: result,
      });
    }

    // Return 503 Service Unavailable if database is unreachable or credentials are not yet configured
    return res.status(503).json({
      status: 'unavailable',
      database: result,
    });
  } catch (err) {
    return res.status(503).json({
      status: 'error',
      database: {
        connected: false,
        error: err.message || 'Database health check failed unexpectedly',
      },
    });
  }
});

export default router;
