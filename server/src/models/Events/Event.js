import mongoose from 'mongoose';

const baseOptions = {
  discriminatorKey: 'type',
  collection: 'Events',
  timestamps: true,
};

const eventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }, // Who created the event in the system
  },
  baseOptions
);

export const Event = mongoose.model('Event', eventSchema);
