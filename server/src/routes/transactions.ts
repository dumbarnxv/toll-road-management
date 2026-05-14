import express, { Router } from 'express';
import { z } from 'zod';
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  deleteTransaction,
} from '../controllers/transactionController';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { transactionLimiter } from '../middleware/rateLimiter';

const router: Router = express.Router();

const transactionSchema = z.object({
  boothId: z.string(),
  vehicleType: z.enum(['car', 'truck', 'bike', 'bus']),
  vehiclePlate: z.string(),
  distance: z.number().optional(),
});

router.post(
  '/',
  authenticateJWT,
  transactionLimiter,
  validateRequest(transactionSchema),
  createTransaction
);
router.get('/', authenticateJWT, getTransactions);
router.get('/:id', authenticateJWT, getTransactionById);
router.delete('/:id', authenticateJWT, requireRole(['admin']), deleteTransaction);

export default router;
