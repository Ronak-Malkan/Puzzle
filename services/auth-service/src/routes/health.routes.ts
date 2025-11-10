import { Router, Request, Response } from 'express';
import pool from '../config/database';
import redisClient from '../config/redis';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  const health = {
    service: 'auth-service',
    status: 'up',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'unknown',
      redis: 'unknown',
    },
  };

  try {
    await pool.query('SELECT 1');
    health.checks.database = 'healthy';
  } catch (error) {
    health.checks.database = 'unhealthy';
    health.status = 'degraded';
  }

  try {
    await redisClient.ping();
    health.checks.redis = 'healthy';
  } catch (error) {
    health.checks.redis = 'unhealthy';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'up' ? 200 : 503;
  res.status(statusCode).json(health);
});

router.get('/ready', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    await redisClient.ping();
    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false });
  }
});

export default router;
