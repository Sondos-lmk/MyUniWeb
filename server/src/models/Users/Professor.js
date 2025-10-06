import mongoose from 'mongoose';
import { User } from './User.js';

const professorSchema = new mongoose.Schema({
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
  favoritesLists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  wallet: { type: Number, default: 0 },
  notifications: [{ type: String }],
  workshops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workshop' }],
});

export const Professor = User.discriminator('professor', professorSchema);
