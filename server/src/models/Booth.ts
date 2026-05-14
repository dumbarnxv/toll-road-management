import mongoose, { Document, Schema } from 'mongoose';

export interface IBooth extends Document {
  name: string;
  location: string;
  gpsCoords: {
    lat: number;
    lon: number;
  };
  status: 'active' | 'inactive' | 'maintenance';
  operatorId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const boothSchema = new Schema<IBooth>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    gpsCoords: {
      lat: {
        type: Number,
        required: true,
      },
      lon: {
        type: Number,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const Booth = mongoose.model<IBooth>('Booth', boothSchema);

export default Booth;
