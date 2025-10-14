import mongoose from 'mongoose';
import { User } from './User.js';

const studentSchema = new mongoose.Schema({
  favoritesLists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'events' }],
  registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'events' }],
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  wallet: { type: Number, default: 0 },
  notifications: [{ type: String }],
  uniID: { type: String, required: true },
});

export const Student = User.discriminator('student', studentSchema);
