"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const pino_http_1 = __importDefault(require("pino-http"));
const dotenv_1 = __importDefault(require("dotenv"));
const prom_client_1 = require("prom-client");
const logger_1 = require("./utils/logger");
const redis_1 = require("./config/redis");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8001;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, pino_http_1.default)({
    logger: logger_1.logger,
    autoLogging: true,
    customLogLevel: (_req, res, err) => {
        if (res.statusCode >= 400 && res.statusCode < 500)
            return 'warn';
        if (res.statusCode >= 500 || err)
            return 'error';
        return 'info';
    },
}));
// Routes
app.use('/', health_routes_1.default);
app.use('/', auth_routes_1.default);
// Metrics endpoint
app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', prom_client_1.register.contentType);
    res.end(await prom_client_1.register.metrics());
});
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Error handler
app.use((err, _req, res, _next) => {
    logger_1.logger.error({ err }, 'Unhandled error');
    res.status(500).json({ error: 'Internal server error' });
});
// Start server
const startServer = async () => {
    try {
        // Connect to Redis
        await (0, redis_1.connectRedis)();
        app.listen(PORT, () => {
            logger_1.logger.info(`Auth service listening on port ${PORT}`);
            logger_1.logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        logger_1.logger.error({ error }, 'Failed to start server');
        process.exit(1);
    }
};
// Graceful shutdown
process.on('SIGTERM', async () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', async () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});
startServer();
//# sourceMappingURL=index.js.map