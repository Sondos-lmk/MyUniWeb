import mongoose from 'mongoose';
import { Event } from './Event.js';

const tripSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String },
  location: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  price: { type: Number, required: true },
});

export const Trip = Event.discriminator('trip', tripSchema);
