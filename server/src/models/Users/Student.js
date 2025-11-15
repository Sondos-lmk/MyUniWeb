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
        enum: ['not paid', 'paid', 'refunded'],
        default: 'not paid'
      },
      priceAtRegistration: {
        type: Number,
        required: true
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
