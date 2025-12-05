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
      enum: ['pending', 'approved', 'rejected', 'completed', 'needs revision', 'cancelled'],
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
      required: false,
    },

    // 🆕 Archive flag (added on dev branch)
    isArchived: {
      type: Boolean,
      default: false,
    },

    // ⭐ Ratings: one rating per user (enforced at controller level)
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        value: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
      },
    ],

    // 💬 Comments: one comment per user (enforced at controller level)
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // 📋 Waitlist: users waiting for spots when event is full
    waitlist: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },

  baseOptions
);

export const Event = mongoose.model('Event', eventSchema);

// Helper: compute rating summary for an event
export const ratingSummary = (event) => {
  if (
    !event ||
    !Array.isArray(event.ratings) ||
    event.ratings.length === 0
  ) {
    return 'unrated';
  }

  const sum = event.ratings.reduce(
    (acc, r) => acc + (Number(r.value) || 0),
    0
  );
  const avg = sum / event.ratings.length;

  // round to 1 decimal place
  return Math.round(avg * 10) / 10;
};