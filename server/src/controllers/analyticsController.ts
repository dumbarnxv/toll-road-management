import { Response } from 'express';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const getRevenueAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const filter: any = {};
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate as string);
      if (endDate) filter.timestamp.$lte = new Date(endDate as string);
    }

    const transactions = await Transaction.find(filter);
    const totalRevenue = transactions.reduce((sum, t) => sum + t.fee, 0);
    const transactionCount = transactions.length;
    const avgFee = transactionCount > 0 ? totalRevenue / transactionCount : 0;

    // Group by date for daily trends
    const dailyRevenue = transactions.reduce((acc, t) => {
      const date = new Date(t.timestamp).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += t.fee;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      transactionCount,
      avgFee: Math.round(avgFee * 100) / 100,
      dailyRevenue: Object.entries(dailyRevenue).map(([date, revenue]) => ({
        date,
        revenue: Math.round(revenue * 100) / 100,
      })),
    });
  } catch (error) {
    logger.error('Revenue analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTrafficAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const filter: any = {};
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate as string);
      if (endDate) filter.timestamp.$lte = new Date(endDate as string);
    }

    const transactions = await Transaction.find(filter);

    // Vehicle type breakdown
    const vehicleBreakdown = transactions.reduce((acc, t) => {
      acc[t.vehicleType] = (acc[t.vehicleType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Hourly breakdown
    const hourlyBreakdown = transactions.reduce((acc, t) => {
      const hour = new Date(t.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    res.json({
      totalVehicles: transactions.length,
      vehicleBreakdown,
      hourlyBreakdown: Object.entries(hourlyBreakdown)
        .map(([hour, count]) => ({
          hour: parseInt(hour),
          count,
        }))
        .sort((a, b) => a.hour - b.hour),
    });
  } catch (error) {
    logger.error('Traffic analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBoothPerformance = async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await Transaction.find();

    const boothStats = transactions.reduce(
      (acc, t) => {
        if (!acc[t.boothId]) {
          acc[t.boothId] = {
            boothId: t.boothId,
            totalRevenue: 0,
            vehicleCount: 0,
            avgFee: 0,
          };
        }
        acc[t.boothId].totalRevenue += t.fee;
        acc[t.boothId].vehicleCount += 1;
        return acc;
      },
      {} as Record<string, any>
    );

    const boothPerformance = Object.values(boothStats)
      .map((stats: any) => ({
        ...stats,
        totalRevenue: Math.round(stats.totalRevenue * 100) / 100,
        avgFee: Math.round((stats.totalRevenue / stats.vehicleCount) * 100) / 100,
      }))
      .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);

    res.json({ boothPerformance });
  } catch (error) {
    logger.error('Booth performance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
