import express, { Router } from 'express';
import {
  getRevenueAnalytics,
  getTrafficAnalytics,
  getBoothPerformance,
} from '../controllers/analyticsController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router: Router = express.Router();

router.get('/revenue', authenticateJWT, requireRole(['admin']), getRevenueAnalytics);
router.get('/traffic', authenticateJWT, requireRole(['admin']), getTrafficAnalytics);
router.get('/booth-performance', authenticateJWT, requireRole(['admin']), getBoothPerformance);

export default router;
