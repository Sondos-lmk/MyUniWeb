// models/Events/ClubApplication.js
import mongoose from "mongoose";

const clubApplicationSchema = new mongoose.Schema(
  {
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
    },
    major: {
      type: String,
      trim: true,
      required: true,
    },

    // ⭐ ADD THESE ⭐
    name: { type: String, trim: true },
    gucId: { type: String, trim: true },
    phone: { type: String, trim: true },

    motivation: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    reviewMessage: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const ClubApplication = mongoose.model(
  "ClubApplication",
  clubApplicationSchema
);