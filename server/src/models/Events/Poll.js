// models/Poll.js
import mongoose from 'mongoose';

const pollVendorSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'vendor',
      required: true,
    },
    name: {
      type: String,
      required: true, // snapshot of vendor name to avoid extra lookups
    },
  },
  { _id: false }
);

const voteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'vendor',
      required: true,
    },
    votedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const pollSchema = new mongoose.Schema(
  {
    booth: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'booth', // Booth is a discriminator of Event with name "booth"
      required: true,
    },

    title: { type: String, required: true },
    question: { type: String, required: true },
    reason: { type: String },

    vendors: {
      type: [pollVendorSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 2,
        message: 'Poll must have at least two vendors',
      },
    },

    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },

    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },

    votes: {
      type: [voteSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const Poll = mongoose.model('Poll', pollSchema);
