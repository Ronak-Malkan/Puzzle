"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const validation_1 = require("../validation");
(0, vitest_1.describe)('Validation Utils', () => {
    (0, vitest_1.describe)('validateEmail', () => {
        (0, vitest_1.it)('should accept valid emails', () => {
            (0, vitest_1.expect)((0, validation_1.validateEmail)('test@example.com')).toBe(true);
            (0, vitest_1.expect)((0, validation_1.validateEmail)('user.name+tag@example.co.uk')).toBe(true);
            (0, vitest_1.expect)((0, validation_1.validateEmail)('john.doe@company.org')).toBe(true);
        });
        (0, vitest_1.it)('should reject invalid emails', () => {
            (0, vitest_1.expect)((0, validation_1.validateEmail)('notanemail')).toBe(false);
            (0, vitest_1.expect)((0, validation_1.validateEmail)('missing@domain')).toBe(false);
            (0, vitest_1.expect)((0, validation_1.validateEmail)('@example.com')).toBe(false);
            (0, vitest_1.expect)((0, validation_1.validateEmail)('test@')).toBe(false);
            (0, vitest_1.expect)((0, validation_1.validateEmail)('')).toBe(false);
        });
    });
});
//# sourceMappingURL=validation.test.js.map