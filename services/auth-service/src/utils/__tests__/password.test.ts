import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword, validatePasswordStrength } from '../password';

describe('Password Utils', () => {
  describe('validatePasswordStrength', () => {
    it('should accept valid passwords', () => {
      expect(validatePasswordStrength('ValidPass1!')).toBe(true);
      expect(validatePasswordStrength('Test@123456')).toBe(true);
      expect(validatePasswordStrength('MyP@ssw0rd')).toBe(true);
    });

    it('should reject passwords without uppercase', () => {
      expect(validatePasswordStrength('nouppercas3!')).toBe(false);
    });

    it('should reject passwords without lowercase', () => {
      expect(validatePasswordStrength('NOLOWERCASE3!')).toBe(false);
    });

    it('should reject passwords without numbers', () => {
      expect(validatePasswordStrength('NoNumbers!')).toBe(false);
    });

    it('should reject passwords without special characters', () => {
      expect(validatePasswordStrength('NoSpecial1')).toBe(false);
    });

    it('should reject passwords shorter than 8 characters', () => {
      expect(validatePasswordStrength('Short1!')).toBe(false);
    });
  });

  describe('hashPassword and comparePassword', () => {
    it('should hash password and verify correctly', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);

      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should fail verification with wrong password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await hashPassword(password);

      const isValid = await comparePassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });
});
