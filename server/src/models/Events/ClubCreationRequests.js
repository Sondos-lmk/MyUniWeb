// models/Events/ClubCreationRequest.js
import mongoose from "mongoose";

const clubCreationRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    desc: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    // student who is requesting the club (and becomes president if accepted)
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const ClubCreationRequest = mongoose.model(
  "ClubCreationRequest",
  clubCreationRequestSchema
);
