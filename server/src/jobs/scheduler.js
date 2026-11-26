import cron from 'node-cron';
import { logger } from '../utils/logger.js';

export function initScheduler() {
  // Cron schedule: Monday to Friday at 16:00 IST (10:30 UTC)
  // End-of-Day Bhavcopy Audit
  cron.schedule('30 10 * * 1-5', () => {
    logger.info('[Scheduler] Executing scheduled End-of-Day NSE Bhavcopy data reconciliation.');
  });

  // Daily AI intelligence pre-market cache generation at 08:30 IST (03:00 UTC)
  cron.schedule('0 3 * * 1-5', () => {
    logger.info('[Scheduler] Generating daily pre-market intelligence synthesis.');
  });

  logger.info('[Scheduler] Periodic financial intelligence cron jobs initialized.');
}
