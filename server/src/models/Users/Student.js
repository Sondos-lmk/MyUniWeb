import mongoose from 'mongoose';
import { User } from './User.js';

const studentSchema = new mongoose.Schema({
  favoritesLists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  wallet: { type: Number, default: 0 },
  notifications: [{ type: String }],
  uniID: { type: String, required: true },
});

export const Student = User.discriminator('student', studentSchema);
