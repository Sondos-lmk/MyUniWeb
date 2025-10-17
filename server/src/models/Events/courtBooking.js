import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    court: { type: mongoose.Schema.Types.ObjectId, ref: "Court", required: true },
    date: { type: Date, required: true },        // date-only, normalized 00:00 UTC
    startTime: { type: String, required: true }, // "HH:MM"
    endTime: { type: String, required: true },   // "HH:MM"
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

bookingSchema.index({ court: 1, date: 1 });
export const CourtBooking = mongoose.model("CourtBooking", bookingSchema);
