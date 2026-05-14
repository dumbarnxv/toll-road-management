import { Response } from 'express';
import Booth from '../models/Booth';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const getAllBooths = async (req: AuthRequest, res: Response) => {
  try {
    const booths = await Booth.find().select('-__v');
    res.json({ booths });
  } catch (error) {
    logger.error('Get booths error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBoothById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const booth = await Booth.findById(id);

    if (!booth) {
      return res.status(404).json({ message: 'Booth not found' });
    }

    res.json({ booth });
  } catch (error) {
    logger.error('Get booth error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createBooth = async (req: AuthRequest, res: Response) => {
  try {
    const { name, location, gpsCoords, status } = req.body;

    const booth = new Booth({
      name,
      location,
      gpsCoords,
      status: status || 'active',
    });

    await booth.save();
    res.status(201).json({ message: 'Booth created', booth });
  } catch (error) {
    logger.error('Create booth error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBooth = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, location, gpsCoords, status } = req.body;

    const booth = await Booth.findByIdAndUpdate(
      id,
      { name, location, gpsCoords, status },
      { new: true }
    );

    if (!booth) {
      return res.status(404).json({ message: 'Booth not found' });
    }

    res.json({ message: 'Booth updated', booth });
  } catch (error) {
    logger.error('Update booth error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteBooth = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const booth = await Booth.findByIdAndDelete(id);

    if (!booth) {
      return res.status(404).json({ message: 'Booth not found' });
    }

    res.json({ message: 'Booth deleted' });
  } catch (error) {
    logger.error('Delete booth error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBoothStats = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const booth = await Booth.findById(id);

    if (!booth) {
      return res.status(404).json({ message: 'Booth not found' });
    }

    const transactions = await Transaction.find({ boothId: id });
    const totalRevenue = transactions.reduce((sum, t) => sum + t.fee, 0);
    const vehicleCount = transactions.length;
    const avgFee = vehicleCount > 0 ? totalRevenue / vehicleCount : 0;

    res.json({
      booth,
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        vehicleCount,
        avgFee: Math.round(avgFee * 100) / 100,
      },
    });
  } catch (error) {
    logger.error('Get booth stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
