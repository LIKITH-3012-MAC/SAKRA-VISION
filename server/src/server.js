import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { initScheduler } from './jobs/scheduler.js';
import { ensurePortfolioTables } from './services/portfolioService.js';
import { ensureWatchlistTables } from './services/watchlistService.js';

const server = app.listen(env.PORT, () => {
  logger.info(`SAKRA VISION backend listening on port ${env.PORT}`, {
    env: env.NODE_ENV,
    url: `http://localhost:${env.PORT}`,
  });
  initScheduler();
  // Ensure tables exist in MySQL if available
  Promise.all([ensurePortfolioTables(), ensureWatchlistTables()]).catch(() => {});
});

function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Shutting down SAKRA VISION server gracefully.`);
  server.close(() => {
    logger.info('Server closed. Process terminating.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
