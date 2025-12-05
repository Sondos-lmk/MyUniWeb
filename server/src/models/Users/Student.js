import mongoose from 'mongoose';
import { User } from './User.js';

const studentSchema = new mongoose.Schema({
  favoritesLists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'events' }],
  registeredEvents: [{ event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
      },
      paymentStatus: {
        type: String,
        required: true,
        enum: ['not paid', 'paid', 'refunded', 'waitlisted'],
        default: 'not paid'
      },
      priceAtRegistration: {
        type: Number,
        required: true
      },
      referralCode: {
        type: String,
        default: null
      },
      referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      }
    }],
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  wallet: { type: Number, default: 0 },
  walletTransactions: [
  {
    amount: Number,
    type: { type: String, enum: ["refund", "payment"] },
    description: String,
    date: { type: Date, default: Date.now }
  }
],

  notifications: [{ type: String }],
  uniID: { type: String, required: true },
});

export const Student = User.discriminator('student', studentSchema);
