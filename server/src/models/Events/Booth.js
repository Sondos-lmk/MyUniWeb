import mongoose from 'mongoose';
import { Event } from './Event.js';

const boothSchema = new mongoose.Schema({
  reps: [
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
  ],
  setupStart: { type: Date, required: true },
  setupEnd: { type: Date, required: true },
  locationInPlatform: { type: String, required: true },
  boothSize: { type: String, enum: ['2x2', '4x4'], required: true },
});

export const Booth = Event.discriminator('booth', boothSchema);
