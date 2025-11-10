"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = exports.query = void 0;
const pg_1 = require("pg");
const logger_1 = require("../utils/logger");
const pool = new pg_1.Pool({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME || 'puzzle_auth_db',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
pool.on('connect', () => {
    logger_1.logger.info('Connected to PostgreSQL database');
});
pool.on('error', (err) => {
    logger_1.logger.error({ err }, 'Unexpected error on idle PostgreSQL client');
    process.exit(-1);
});
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        logger_1.logger.debug({ text, duration, rows: res.rowCount }, 'Executed query');
        return res;
    }
    catch (error) {
        logger_1.logger.error({ error, text }, 'Database query error');
        throw error;
    }
};
exports.query = query;
const getClient = () => pool.connect();
exports.getClient = getClient;
exports.default = pool;
//# sourceMappingURL=database.js.map