import mongoose, { Document, Schema } from 'mongoose';

export interface IVehicle extends Document {
  plate: string;
  type: 'car' | 'truck' | 'bike' | 'bus';
  owner: string;
  registrationNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    plate: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['car', 'truck', 'bike', 'bus'],
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
    registrationNumber: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Vehicle = mongoose.model<IVehicle>('Vehicle', vehicleSchema);

export default Vehicle;
