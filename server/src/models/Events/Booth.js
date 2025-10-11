import mongoose from 'mongoose';
import { Event } from './Event.js'; // if using discriminators

const boothSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g. "Booth A1"
  locationInPlatform: { type: String, required: true }, // e.g. "Platform Zone B"
  boothSize: { type: String, enum: ['2x2', '4x4'], required: true },

  // Vendors who rented this booth
  registeredVendors: {
    type: [
      {
        vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        reps: [
          {
            name: { type: String, required: true },
            email: { type: String, required: true }
          }
        ],
        durationWeeks: { type: Number, min: 1, max: 4, required: true },
        startDate: { type: Date, required: true }, // when rental starts
        endDate: { type: Date, required: true },   // automatically derived or manually added
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending'
        }
      }
    ],
    default: []
  },

  status: { type: String, enum: ['available', 'unavailable'], default: 'available' }
}, { timestamps: true });

export const Booth = Event.discriminator('booth', boothSchema);
