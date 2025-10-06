import mongoose from 'mongoose';
import { User } from './User.js';

const adminSchema = new mongoose.Schema({
  notifications: [{ type: String }],
});

export const Admin = User.discriminator('admin', adminSchema);
