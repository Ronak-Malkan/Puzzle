"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = void 0;
const redis_1 = require("redis");
const logger_1 = require("../utils/logger");
const redisClient = (0, redis_1.createClient)({
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    },
});
redisClient.on('error', (err) => {
    logger_1.logger.error({ err }, 'Redis client error');
});
redisClient.on('connect', () => {
    logger_1.logger.info('Connected to Redis');
});
const connectRedis = async () => {
    await redisClient.connect();
};
exports.connectRedis = connectRedis;
exports.default = redisClient;
//# sourceMappingURL=redis.js.map