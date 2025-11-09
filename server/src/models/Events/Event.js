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
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who created the event in the system

    // ✅ Add this new field here:
 
     allowedRoles: {
  type: [String],
  enum: ["student", "staff", "ta", "professor"],
  default: ["student", "staff", "ta", "professor"], // optional
},
 // default: open to all academic users
    },

  baseOptions
);

export const Event = mongoose.model('Event', eventSchema);
