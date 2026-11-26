import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Route modules
import healthRoutes from './routes/healthRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import screenerRoutes from './routes/screenerRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import researchRoutes from './routes/researchRoutes.js';
import predictionRoutes, { backtestRouter } from './routes/predictionRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const app = express();

// Security: Disable X-Powered-By
app.disable('x-powered-by');

// Security: Restrict CORS to configured frontend origins
app.use(cors({
  origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

// Health & System Routes: available under /api and /api/v1
// Explicitly satisfies: GET /api/health and GET /api/health/db
app.use('/api', healthRoutes);
app.use('/api/v1', healthRoutes);
app.use('/api/v1', systemRoutes);

// Intelligence & Market API Endpoints
// Mount on both /api/market, /api/screener and /api/v1/*
app.use('/api/screener', screenerRoutes);
app.use('/api/v1/screener', screenerRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/v1/market', marketRoutes);
app.use('/api/v1/stocks', stockRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/v1/portfolio', portfolioRoutes);
app.use('/api/watchlists', watchlistRoutes);
app.use('/api/v1/watchlists', watchlistRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/v1/research', researchRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/v1/predictions', predictionRoutes);
app.use('/api/backtests', backtestRouter);
app.use('/api/v1/backtests', backtestRouter);
app.use('/api/v1/reports', reportRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Centralized error handling
app.use(errorHandler);

export default app;
