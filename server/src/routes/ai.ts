import express, { Router } from 'express';
import Transaction from '../models/Transaction';
import Booth from '../models/Booth';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { generateTrafficInsights, generateRevenueAnalysis } from '../utils/aiInsights';
import { logger } from '../utils/logger';

const router: Router = express.Router();

router.get('/insights', authenticateJWT, requireRole(['admin']), async (req, res) => {
  try {
    const transactions = await Transaction.find().limit(1000);
    const booths = await Booth.find().limit(100);

    const insights = await generateTrafficInsights(transactions, booths);

    res.json({
      insights,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('AI insights error:', error);
    res.status(500).json({ message: 'Failed to generate insights' });
  }
});

router.get('/revenue-analysis', authenticateJWT, requireRole(['admin']), async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const transactions = await Transaction.find({
      timestamp: { $gte: startDate },
    });

    const dailyData = transactions.reduce((acc, t) => {
      const date = new Date(t.timestamp).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { totalFee: 0 };
      }
      acc[date].totalFee += t.fee;
      return acc;
    }, {} as Record<string, any>);

    const analysis = await generateRevenueAnalysis(Object.values(dailyData));

    res.json({
      analysis,
      dailyData: Object.entries(dailyData).map(([date, data]) => ({
        date,
        ...data,
      })),
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Revenue analysis error:', error);
    res.status(500).json({ message: 'Failed to generate analysis' });
  }
});

export default router;
