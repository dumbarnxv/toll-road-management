import express, { Router } from 'express';
import passport from 'passport';
import { z } from 'zod';
import { register, login, refresh, getCurrentUser, logout } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimiter';

const router: Router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['admin', 'operator']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/refresh', refresh);
router.get('/me', authenticateJWT, getCurrentUser);
router.post('/logout', authenticateJWT, logout);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  }
);

export default router;
