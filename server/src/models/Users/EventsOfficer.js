import mongoose from 'mongoose';
import { User } from './User.js';

const eventOfficerSchema = new mongoose.Schema({
  notifications: [{ type: String }],
});

export const EventOfficer = User.discriminator('eventOfficer', eventOfficerSchema);
