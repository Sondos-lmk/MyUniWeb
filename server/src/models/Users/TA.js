
import mongoose from 'mongoose';
import { User } from './User.js';

const taSchema = new mongoose.Schema({
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
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
    workshops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'events' }],
});

export const TA = User.discriminator('ta', taSchema);
