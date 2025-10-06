import mongoose from 'mongoose';
import { User } from './User.js';

const staffSchema = new mongoose.Schema({
  favoritesLists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  wallet: { type: Number, default: 0 },
  notifications: [{ type: String }],
});

export const Staff = User.discriminator('staff', staffSchema);
