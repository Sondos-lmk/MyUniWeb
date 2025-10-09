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
    capacity: { type: Number, required: true, min: 1 }, // added
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // link to organizer
    registeredStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // who registered
  },
  { timestamps: true }
);

// keep the discriminator name as 'trip' to match other code
export const Trip = Event.discriminator('trip', tripSchema);
