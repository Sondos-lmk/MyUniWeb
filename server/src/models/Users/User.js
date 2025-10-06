import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const baseOptions = {
  discriminatorKey: 'role', // model name stored in documents
  collection: 'users',
  timestamps: true,
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['student', 'staff', 'professor', 'vendor', 'admin', 'eventOfficer'],
    },
  },
  baseOptions
);

// 🔒 Password comparison method
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model('User', userSchema);

