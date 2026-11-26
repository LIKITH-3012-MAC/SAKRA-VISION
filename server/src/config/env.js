import dotenv from 'dotenv';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1024).max(65535).default(4000),
  CLIENT_URL: z.string().default('http://localhost:5173'),

  // MySQL Database Configuration (Aiven Cloud MySQL or local MySQL)
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  DB_NAME: z.string().min(1).default('sakra_stocks'),
  DB_USER: z.string().min(1).default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_SSL: z.preprocess((val) => {
    if (typeof val === 'string') {
      const lower = val.toLowerCase().trim();
      return lower === 'true' || lower === '1' || lower === 'required';
    }
    return Boolean(val);
  }, z.boolean()).default(false),
  DB_SSL_CA_PATH: z.string().optional().default(''),

  // Groq AI Service (MANDATORY: Official Groq API only, strictly NO Ollama)
  GROQ_API_KEY: z.string().optional().default(''),
  GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),
  GROQ_BASE_URL: z.string().default('https://api.groq.com/openai/v1'),

  // Firecrawl Web Research API
  FIRECRAWL_API_KEY: z.string().optional().default(''),

  // Groww Market Data Integration
  GROWW_API_KEY: z.string().optional().default(''),
  GROWW_ACCESS_TOKEN: z.string().optional().default(''),

  MARKET_DATA_MODE: z.enum(['historical', 'live']).default('historical'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Format errors without logging any sensitive values
  const formattedErrors = parsed.error.issues.map(i => ({
    path: i.path.join('.'),
    message: i.message,
  }));
  logger.error('Environment configuration validation failed', { errors: formattedErrors });
  process.exit(1);
}

export const env = parsed.data;
