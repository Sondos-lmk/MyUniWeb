// server/src/models/Events/GymSession.js
import mongoose from "mongoose";
import { Event } from "./Event.js";

const gymSessionSchema = new mongoose.Schema(
  {
    // inherits: title/createdBy/status/type/etc. from Event via discriminator

    title: { type: String, required: true }, // Session name/title

    sessionType: { type: String, default: "general" }, // e.g. "cross circuit", "cardio", etc.

    date: { type: Date, required: true },
    time: { type: String, required: true }, // "10:30"
    duration: { type: Number, required: true }, // minutes
    maxParticipants: { type: Number, required: true },

    // users who registered for this session
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const GymSession = Event.discriminator("gym", gymSessionSchema);