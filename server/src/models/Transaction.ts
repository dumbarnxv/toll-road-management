import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  boothId: string;
  vehicleType: 'car' | 'truck' | 'bike' | 'bus';
  vehiclePlate: string;
  fee: number;
  distance: number;
  operatorId: string;
  timestamp: Date;
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    boothId: {
      type: String,
      required: true,
      index: true,
    },
    vehicleType: {
      type: String,
      enum: ['car', 'truck', 'bike', 'bus'],
      required: true,
    },
    vehiclePlate: {
      type: String,
      required: true,
      index: true,
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
    distance: {
      type: Number,
      required: true,
      min: 0,
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
