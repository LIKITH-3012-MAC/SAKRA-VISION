import { Router } from 'express';
import { env } from '../config/env.js';
import { isDbConnected } from '../config/db.js';
import { groqClient } from '../integrations/groq/groqClient.js';
import { firecrawlClient } from '../integrations/firecrawl/firecrawlClient.js';
import { growwClient } from '../integrations/groww/growwClient.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    product: 'SAKRA VISION',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      database: isDbConnected,
      groq: groqClient.isConfigured(),
      firecrawl: firecrawlClient.isConfigured(),
      groww: growwClient.isLiveAuthorized(),
    },
    mode: env.MARKET_DATA_MODE,
  });
});

router.get('/status', (req, res) => {
  res.json({
    status: 'healthy',
    mode: env.MARKET_DATA_MODE,
    growwStatus: growwClient.getStatus(),
    groqConfigured: groqClient.isConfigured(),
    groqModel: env.GROQ_MODEL,
    firecrawlConfigured: firecrawlClient.isConfigured(),
  });
});

export default router;
