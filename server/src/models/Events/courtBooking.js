import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    court: { type: mongoose.Schema.Types.ObjectId, ref: "Court", required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // NEW
    studentName: { type: String, required: true },
    studentGucId: { type: String, required: true },
  },
  { timestamps: true }
);


bookingSchema.index({ court: 1, date: 1 });
export const CourtBooking = mongoose.model("CourtBooking", bookingSchema);
