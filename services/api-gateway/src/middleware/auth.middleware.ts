import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'dev_secret_key_change_in_production';
    const payload = jwt.verify(token, secret) as { id: number; email: string };
    req.user = payload;
    next();
  } catch (error) {
    logger.warn({ error }, 'Invalid token');
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Optional auth - doesn't fail if no token, just doesn't set user
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'dev_secret_key_change_in_production';
    const payload = jwt.verify(token, secret) as { id: number; email: string };
    req.user = payload;
  } catch (error) {
    logger.debug({ error }, 'Optional auth failed, continuing without user');
  }

  next();
};
