import mongoose from 'mongoose';
import { User } from './User.js';

const vendorSchema = new mongoose.Schema({
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
  companyName: { type: String, required: true },
  appliedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
});

export const Vendor = User.discriminator('vendor', vendorSchema);
