import mongoose from 'mongoose';
import { Event } from './Event.js';

const tripSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    desc: { type: String, default: '' },
    location: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    price: { type: Number, required: true },
    capacity: { type: Number, required: true, min: 1 },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // always linked to the Event Officer
    },
  },
  { timestamps: true }
);

// keep discriminator name consistent
export const Trip = Event.discriminator('trip', tripSchema);
