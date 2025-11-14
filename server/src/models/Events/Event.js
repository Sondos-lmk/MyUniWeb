import mongoose from 'mongoose';

const baseOptions = {
  discriminatorKey: 'type',
  collection: 'events',
  timestamps: true,
};
const eventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'needs revision'],
      default: 'pending',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    allowedRoles: {
      type: [String],
      enum: ['student', 'staff', 'ta', 'professor'],
      default: ['student', 'staff', 'ta', 'professor'],
    },

    // 🆕 Add these here
    endDate: {
      type: Date,
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },

  baseOptions
);


export const Event = mongoose.model('Event', eventSchema);
