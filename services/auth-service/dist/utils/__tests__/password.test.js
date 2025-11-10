"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const password_1 = require("../password");
(0, vitest_1.describe)('Password Utils', () => {
    (0, vitest_1.describe)('validatePasswordStrength', () => {
        (0, vitest_1.it)('should accept valid passwords', () => {
            (0, vitest_1.expect)((0, password_1.validatePasswordStrength)('ValidPass1!')).toBe(true);
            (0, vitest_1.expect)((0, password_1.validatePasswordStrength)('Test@123456')).toBe(true);
            (0, vitest_1.expect)((0, password_1.validatePasswordStrength)('MyP@ssw0rd')).toBe(true);
        });
        (0, vitest_1.it)('should reject passwords without uppercase', () => {
            (0, vitest_1.expect)((0, password_1.validatePasswordStrength)('nouppercas3!')).toBe(false);
        });
        (0, vitest_1.it)('should reject passwords without lowercase', () => {
            (0, vitest_1.expect)((0, password_1.validatePasswordStrength)('NOLOWERCASE3!')).toBe(false);
        });
        (0, vitest_1.it)('should reject passwords without numbers', () => {
            (0, vitest_1.expect)((0, password_1.validatePasswordStrength)('NoNumbers!')).toBe(false);
        });
        (0, vitest_1.it)('should reject passwords without special characters', () => {
            (0, vitest_1.expect)((0, password_1.validatePasswordStrength)('NoSpecial1')).toBe(false);
        });
        (0, vitest_1.it)('should reject passwords shorter than 8 characters', () => {
            (0, vitest_1.expect)((0, password_1.validatePasswordStrength)('Short1!')).toBe(false);
        });
    });
    (0, vitest_1.describe)('hashPassword and comparePassword', () => {
        (0, vitest_1.it)('should hash password and verify correctly', async () => {
            const password = 'TestPassword123!';
            const hash = await (0, password_1.hashPassword)(password);
            (0, vitest_1.expect)(hash).not.toBe(password);
            (0, vitest_1.expect)(hash.length).toBeGreaterThan(0);
            const isValid = await (0, password_1.comparePassword)(password, hash);
            (0, vitest_1.expect)(isValid).toBe(true);
        });
        (0, vitest_1.it)('should fail verification with wrong password', async () => {
            const password = 'TestPassword123!';
            const wrongPassword = 'WrongPassword123!';
            const hash = await (0, password_1.hashPassword)(password);
            const isValid = await (0, password_1.comparePassword)(wrongPassword, hash);
            (0, vitest_1.expect)(isValid).toBe(false);
        });
    });
});
//# sourceMappingURL=password.test.js.map