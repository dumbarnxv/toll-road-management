import express, { Router } from 'express';
import { z } from 'zod';
import {
  getAllBooths,
  getBoothById,
  createBooth,
  updateBooth,
  deleteBooth,
  getBoothStats,
} from '../controllers/boothController';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router: Router = express.Router();

const boothSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  gpsCoords: z.object({
    lat: z.number(),
    lon: z.number(),
  }),
  status: z.enum(['active', 'inactive', 'maintenance']).optional(),
});

router.get('/', getAllBooths);
router.get('/:id', getBoothById);
router.get('/:id/stats', authenticateJWT, getBoothStats);

router.post('/', authenticateJWT, requireRole(['admin']), validateRequest(boothSchema), createBooth);
router.put('/:id', authenticateJWT, requireRole(['admin']), validateRequest(boothSchema), updateBooth);
router.delete('/:id', authenticateJWT, requireRole(['admin']), deleteBooth);

export default router;
