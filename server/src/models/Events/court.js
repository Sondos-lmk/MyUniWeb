import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    dayOfWeek: { type: Number, min: 0, max: 6, required: true }, // 0=Sun … 6=Sat
    startTime: { type: String, required: true }, // "HH:MM" 24h
    endTime: { type: String, required: true },   // "HH:MM"
  },
  { _id: false }
);

const courtSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., "Court A"
    type: { type: String, enum: ["basketball", "tennis", "football"], required: true },
    location: { type: String, required: true },
    // recurring weekly opening slots (NOT bookings)
    weeklySlots: { type: [slotSchema], default: [] },
  },
  { timestamps: true }
);

export const Court = mongoose.model("Court", courtSchema);
