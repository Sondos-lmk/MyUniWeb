import mongoose from 'mongoose';

const baseOptions = {
  discriminatorKey: 'type',
  collection: 'events',
  timestamps: true,
};

// const eventSchema = new mongoose.Schema(
  




//   {
//     status: {
//       type: String,
//       enum: ['pending', 'approved', 'rejected', 'completed'],
//       default: 'pending',
//     },
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }, // Who created the event in the system
//   },
//   baseOptions
// );

// export const Event = mongoose.model('Event', eventSchema);
// // helper (non-virtual) to compute average rating quickly where needed
// export function computeAvgRating(evt) {
//   if (!evt?.ratings?.length) return 0;
//   const sum = evt.ratings.reduce((a, r) => a + r.value, 0);
//   return Math.round((sum / evt.ratings.length) * 10) / 10;
// }

const eventSchema = new mongoose.Schema(
  {
    // from your additions
    registeredStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        value: { type: Number, min: 1, max: 5, required: true },
      },
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // from your original schema
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

// helper (non-virtual) to compute average rating quickly where needed
export function computeAvgRating(evt) {
  if (!evt?.ratings?.length) return 0;
  const sum = evt.ratings.reduce((a, r) => a + r.value, 0);
  return Math.round((sum / evt.ratings.length) * 10) / 10;
}
export function ratingSummary(evt) {
  // Consider "unrated" if future event OR no ratings
  const start = evt?.startDate || evt?.date; // adjust to your actual start field name if different
  if (start && new Date(start) > new Date()) return 'unrated';
  if (!evt?.ratings || evt.ratings.length === 0) return 'unrated';
  return computeAvgRating(evt);
}
