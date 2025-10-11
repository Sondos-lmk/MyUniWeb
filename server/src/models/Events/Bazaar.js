import mongoose from 'mongoose';
import { Event } from './Event.js';
import Joi from 'joi';

const bazaarSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String },
  location: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  vendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
  registeredVendors: {
    type: [
      {
        vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
        status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
        reps: [
          { _id: false,  // optional: also disable _id for reps if you want
            name: { type: String, required: true },
            email: { type: String, required: true }
          }
        ],
        boothSize: { type: String, enum: ['2x2','4x4'], required: true }
      }
    ],
    default: []
  }
});

export const Bazaar = Event.discriminator('bazaar', bazaarSchema);
