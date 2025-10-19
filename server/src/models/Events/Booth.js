import mongoose from 'mongoose';
import { Event } from './Event.js';

const boothSchema = new mongoose.Schema({
  title: { type: String, required: true },
  locationInPlatform: { type: String, required: true },
  registeredVendors: {
    type: [
      {
        vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'vendor', required: true },
        reps: [
          {
            name: { type: String, required: true },
            email: { type: String, required: true },
          },
        ],
        durationWeeks: { type: Number, min: 1, max: 4, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
        boothSize: { type: String, enum: ['2x2', '4x4'], required: true },
      },
    ],
    default: [],
  },
}, { timestamps: true });

export const Booth = Event.discriminator('booth', boothSchema);
