import mongoose from 'mongoose';
import { Event } from './Event.js';

const bazaarSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String },
  location: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  vendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
});

export const Bazaar = Event.discriminator('bazaar', bazaarSchema);
