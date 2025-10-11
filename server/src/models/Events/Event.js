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
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }, // who is organizing it
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }, // Who created the event in the system
  },
  baseOptions
);

export const Event = mongoose.model('Event', eventSchema);
