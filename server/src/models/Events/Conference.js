import mongoose from 'mongoose';
import { Event } from './Event.js';

const conferenceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: { type: Date },
  fullAgenda: { type: String },
  websiteLink: { type: String, required: true },
  requiredBudget: { type: Number },
  fundraisingSource: { type: String, enum: ['GUC', 'External'] },
  extraRequiredResource: { type: String },
});

export const Conference = Event.discriminator('conference', conferenceSchema);
