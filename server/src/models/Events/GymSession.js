import mongoose from 'mongoose';
import { Event } from './Event.js';

const gymSessionSchema = new mongoose.Schema({
  sessionType: { 
    type: String, 
    enum: ['yoga', 'pilates', 'zumba', 'cross circuit', 'kickboxing'],
    required: true 
  },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes or hours
  maxParticipants: { type: Number, required: true },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
});

export const GymSession = Event.discriminator('gym', gymSessionSchema);
