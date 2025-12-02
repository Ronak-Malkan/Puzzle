import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { register } from 'prom-client';

import { logger } from './utils/logger';
import { connectRedis, redisClient } from './config/redis';
import {
  authProxy,
  blockProxy,
  tableProxy,
  blogProxy,
  notificationProxy,
} from './config/proxy';
import { authenticateToken } from './middleware/auth.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors());
app.use(
  pinoHttp({
    logger,
    autoLogging: true,
    customLogLevel: (_req, res, err) => {
      if (res.statusCode >= 400 && res.statusCode < 500) return 'warn';
      if (res.statusCode >= 500 || err) return 'error';
      return 'info';
    },
  })
);

// Rate limiting will be added after Redis connection
// This will be set up in startServer function

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
  });
});

// Metrics endpoint
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Proxy routes
// Auth routes (no authentication required for login/signup)
app.use('/api/auth', authProxy);

// Block routes (require authentication)
app.use('/api/blocks', authenticateToken, blockProxy);

// Table routes (require authentication)
app.use('/api/tables', authenticateToken, tableProxy);

// Blog routes (require authentication)
app.use('/api/blogs', authenticateToken, blogProxy);

// Notification routes (require authentication)
app.use('/api/notifications', authenticateToken, notificationProxy);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    logger.error({ err }, 'Unhandled error');
    res.status(500).json({ error: 'Internal server error' });
  }
);

// Start server
const startServer = async () => {
  try {
    // Connect to Redis
    await connectRedis();

    // Set up rate limiting after Redis is connected
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      store: new RedisStore({
        sendCommand: async (...args: string[]) => {
          return await redisClient.sendCommand(args);
        },
        prefix: 'rl:',
      }),
      message: 'Too many requests from this IP, please try again later',
    });

    app.use(limiter);

    app.listen(PORT, () => {
      logger.info(`API Gateway listening on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await redisClient.quit();
  process.exit(0);
});

startServer();
