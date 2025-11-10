import { describe, it, expect, beforeAll } from 'vitest';
import { generateToken, verifyToken } from '../jwt';

describe('JWT Utils', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-key';
  });

  it('should generate a valid JWT token', () => {
    const payload = { id: 1, email: 'test@example.com' };
    const token = generateToken(payload);

    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  it('should verify and decode a valid token', () => {
    const payload = { id: 1, email: 'test@example.com' };
    const token = generateToken(payload);

    const decoded = verifyToken(token);

    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
  });

  it('should throw error for invalid token', () => {
    const invalidToken = 'invalid.token.here';

    expect(() => verifyToken(invalidToken)).toThrow();
  });

  it('should throw error for tampered token', () => {
    const payload = { id: 1, email: 'test@example.com' };
    const token = generateToken(payload);
    const tamperedToken = token.slice(0, -5) + 'xxxxx';

    expect(() => verifyToken(tamperedToken)).toThrow();
  });
});
