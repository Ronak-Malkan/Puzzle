import { Router, Request, Response } from 'express';
import * as AuthService from '../services/auth.service';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

// Signup endpoint
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, firstname, lastname } = req.body;

    if (!email || !password || !firstname || !lastname) {
      return res.status(400).json({
        error: 'Missing required fields: email, password, firstname, lastname',
      });
    }

    const result = await AuthService.signup({
      email,
      password,
      firstname,
      lastname,
    });

    res.status(201).json(result);
  } catch (error: any) {
    logger.error({ error }, 'Signup error');
    res.status(400).json({ error: error.message || 'Signup failed' });
  }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: email, password',
      });
    }

    const result = await AuthService.login({ email, password });

    res.status(200).json(result);
  } catch (error: any) {
    logger.error({ error }, 'Login error');
    res.status(401).json({ error: error.message || 'Login failed' });
  }
});

// Get current user info (protected route)
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userInfo = await AuthService.getUserInfo(req.user.id);
    res.status(200).json(userInfo);
  } catch (error: any) {
    logger.error({ error }, 'Get user info error');
    res.status(400).json({ error: error.message || 'Failed to get user info' });
  }
});

// Verify token endpoint (used by API gateway)
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const { verifyToken } = await import('../utils/jwt');
    const payload = verifyToken(token);

    res.status(200).json({ valid: true, user: payload });
  } catch (error: any) {
    logger.warn({ error }, 'Token verification failed');
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

export default router;
