"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const jwt_1 = require("../jwt");
(0, vitest_1.describe)('JWT Utils', () => {
    (0, vitest_1.beforeAll)(() => {
        process.env.JWT_SECRET = 'test-secret-key';
    });
    (0, vitest_1.it)('should generate a valid JWT token', () => {
        const payload = { id: 1, email: 'test@example.com' };
        const token = (0, jwt_1.generateToken)(payload);
        (0, vitest_1.expect)(token).toBeTruthy();
        (0, vitest_1.expect)(typeof token).toBe('string');
        (0, vitest_1.expect)(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
    (0, vitest_1.it)('should verify and decode a valid token', () => {
        const payload = { id: 1, email: 'test@example.com' };
        const token = (0, jwt_1.generateToken)(payload);
        const decoded = (0, jwt_1.verifyToken)(token);
        (0, vitest_1.expect)(decoded.id).toBe(payload.id);
        (0, vitest_1.expect)(decoded.email).toBe(payload.email);
    });
    (0, vitest_1.it)('should throw error for invalid token', () => {
        const invalidToken = 'invalid.token.here';
        (0, vitest_1.expect)(() => (0, jwt_1.verifyToken)(invalidToken)).toThrow();
    });
    (0, vitest_1.it)('should throw error for tampered token', () => {
        const payload = { id: 1, email: 'test@example.com' };
        const token = (0, jwt_1.generateToken)(payload);
        const tamperedToken = token.slice(0, -5) + 'xxxxx';
        (0, vitest_1.expect)(() => (0, jwt_1.verifyToken)(tamperedToken)).toThrow();
    });
});
//# sourceMappingURL=jwt.test.js.map