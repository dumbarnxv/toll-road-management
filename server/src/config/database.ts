import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectMongoDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(uri, {
      retryWrites: true,
      w: 'majority',
    });

    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default mongoose;
