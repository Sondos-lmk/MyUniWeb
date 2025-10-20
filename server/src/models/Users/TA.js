
import mongoose from 'mongoose';
import { User } from './User.js';

const taSchema = new mongoose.Schema({
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    favoritesLists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'events' }],
    registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    wallet: { type: Number, default: 0 },
    notifications: [{ type: String }],
    workshops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'events' }],
});

export const TA = User.discriminator('ta', taSchema);
