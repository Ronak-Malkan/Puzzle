"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const redis_1 = __importDefault(require("../config/redis"));
const router = (0, express_1.Router)();
router.get('/health', async (_req, res) => {
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
        await database_1.default.query('SELECT 1');
        health.checks.database = 'healthy';
    }
    catch (error) {
        health.checks.database = 'unhealthy';
        health.status = 'degraded';
    }
    try {
        await redis_1.default.ping();
        health.checks.redis = 'healthy';
    }
    catch (error) {
        health.checks.redis = 'unhealthy';
        health.status = 'degraded';
    }
    const statusCode = health.status === 'up' ? 200 : 503;
    res.status(statusCode).json(health);
});
router.get('/ready', async (_req, res) => {
    try {
        await database_1.default.query('SELECT 1');
        await redis_1.default.ping();
        res.status(200).json({ ready: true });
    }
    catch (error) {
        res.status(503).json({ ready: false });
    }
});
exports.default = router;
//# sourceMappingURL=health.routes.js.map