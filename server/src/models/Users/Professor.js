import mongoose from 'mongoose';
import { User } from './User.js';

const professorSchema = new mongoose.Schema({
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
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
  favoritesLists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'events' }],
  wallet: { type: Number, default: 0 },
  notifications: [{ type: String }],
  workshops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'events' }],
});

export const Professor = User.discriminator('professor', professorSchema);
