import mongoose from 'mongoose';
import { User } from './User.js';

const staffSchema = new mongoose.Schema({
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
        enum: ['not paid', 'paid', 'refunded'],
        default: 'not paid'
      },
      priceAtRegistration: {
        type: Number,
        required: true
      }
    }],
  wallet: { type: Number, default: 0 },
  notifications: [{ type: String }],
});

export const Staff = User.discriminator('staff', staffSchema);
