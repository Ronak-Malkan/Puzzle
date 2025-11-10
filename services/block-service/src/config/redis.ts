import { createClient } from 'redis';
import { logger } from '../utils/logger';

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

redisClient.on('error', (err) => {
  logger.error({ err }, 'Redis client error');
});

redisClient.on('connect', () => {
  logger.info('Connected to Redis');
});

export const connectRedis = async () => {
  await redisClient.connect();
};

export default redisClient;
