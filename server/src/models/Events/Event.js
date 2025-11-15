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

    // Allowed roles for registering for the event
    allowedRoles: {
      type: [String],
      enum: ['student', 'staff', 'ta', 'professor'],
      default: ['student', 'staff', 'ta', 'professor'],
    },

    // Track which users already got reminder notifications
    reminderDaySentTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    reminderHourSentTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // 🆕 End date for events (added on dev branch)
    endDate: {
      type: Date,
      required: true,
    },

    // 🆕 Archive flag (added on dev branch)
    isArchived: {
      type: Boolean,
      default: false,
    },
  },

  baseOptions
);

export const Event = mongoose.model('Event', eventSchema);
