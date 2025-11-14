import mongoose from 'mongoose';
import { Event } from './Event.js';

const boothSchema = new mongoose.Schema({
  title: { type: String, required: true },
  locationInPlatform: { type: String, required: true },
  basePricePerDay: { type: Number, default: 2000, min: 0, required: true },
  registeredVendors: {
    type: [
      {
        vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'vendor', required: true },
        reps: [
          {
            name: { type: String, required: true },
            email: { type: String, required: true },
          },
        ],
        workers: [
          {
            name: { type: String, required: true },
            idPicture: { type: String, required: true },
            addedAt: { type: Date, default: Date.now },
          },
        ],
        durationWeeks: { type: Number, min: 1, max: 4, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
        boothSize: { type: String, enum: ['2x2', '4x4'], required: true },
        finalPrice: { type: Number, required: true },
        paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
        paymentDeadline: { type: Date },
        workersSubmitted: { type: Boolean, default: false },
      },
    ],
    default: [],
  },
}, { timestamps: true });

// ------------------- Pre-save middleware -------------------
boothSchema.pre("save", function (next) {
  const now = new Date();

  this.registeredVendors.forEach((vendor) => {
    // Calculate finalPrice if not set
    if (!vendor.finalPrice) {
      const days = vendor.durationWeeks * 7;
      const sizeMultiplier = vendor.boothSize === "4x4" ? 1.5 : 1;
      vendor.finalPrice = this.basePricePerDay * days * sizeMultiplier;
    }

    // Set paymentDeadline 3 days after approval only if approved AND unpaid
    if (vendor.status === 'approved' && vendor.paymentStatus === 'unpaid' && !vendor.paymentDeadline) {
      vendor.paymentDeadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
    }
  });

  next();
});


export const Booth = Event.discriminator('booth', boothSchema);
