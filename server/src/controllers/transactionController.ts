import { Response } from 'express';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';
import { calculateTollFee } from '../utils/calculateFee';
import { logger } from '../utils/logger';

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { boothId, vehicleType, vehiclePlate, distance } = req.body;
    const io = req.app.get('io');

    const fee = calculateTollFee(vehicleType, distance || 10);

    const transaction = new Transaction({
      boothId,
      vehicleType,
      vehiclePlate: vehiclePlate.toUpperCase(),
      fee,
      distance: distance || 10,
      operatorId: req.user.id,
      paymentStatus: 'completed',
    });

    await transaction.save();

    // Emit real-time update via WebSocket
    io.emit('transaction:new', {
      id: transaction._id,
      boothId,
      vehicleType,
      fee,
      timestamp: transaction.timestamp,
    });

    res.status(201).json({
      message: 'Transaction recorded',
      transaction,
      fee,
    });
  } catch (error) {
    logger.error('Create transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const { boothId, vehicleType, startDate, endDate, limit = 100, page = 1 } = req.query;

    const filter: any = {};
    if (boothId) filter.boothId = boothId;
    if (vehicleType) filter.vehicleType = vehicleType;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate as string);
      if (endDate) filter.timestamp.$lte = new Date(endDate as string);
    }

    const skip = ((page as number) - 1) * (limit as number);
    const transactions = await Transaction.find(filter)
      .limit(limit as number)
      .skip(skip)
      .sort({ timestamp: -1 });

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / (limit as number)),
      },
    });
  } catch (error) {
    logger.error('Get transactions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTransactionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id).populate('operatorId', 'name email');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    logger.error('Get transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByIdAndDelete(id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    logger.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
