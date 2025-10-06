import mongoose from 'mongoose';
import { User } from './User.js';

const eventOfficerSchema = new mongoose.Schema({
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
  notifications: [{ type: String }],
});

export const EventOfficer = User.discriminator('eventOfficer', eventOfficerSchema);
