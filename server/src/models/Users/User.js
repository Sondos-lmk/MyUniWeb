import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const baseOptions = {
  discriminatorKey: 'role',
  collection: 'Users',
  timestamps: true,
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: function () {
        return this.role !== 'vendor';
      },
    },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['student', 'staff', 'professor', 'vendor', 'admin', 'eventOfficer'],
    },
    // 🔽 added for email verification
    verificationToken: { type: String },
    verificationExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
  },
  baseOptions
);

// 🔒 Password comparison method
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model('User', userSchema);
