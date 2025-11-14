import mongoose from 'mongoose';
import { Event } from './Event.js';

const bazaarSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String },
  location: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  basePricePerDay: { type: Number, default: 1000, min: 0, required: true },
  registeredVendors: {
    type: [
      {
        vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'vendor' },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        reps: [
          {
            _id: false,
            name: { type: String, required: true },
            email: { type: String, required: true }
          }
        ],
        workers: [
          {
            name: { type: String, required: true },
            idPicture: { type: String, required: true },
            addedAt: { type: Date, default: Date.now }
          },
        ],
        boothSize: { type: String, enum: ['2x2', '4x4'], required: true },
        finalPrice: { type: Number, required: true },
        paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
        paymentDeadline: { type: Date }, // ✅ new field
        workersSubmitted: { type: Boolean, default: false } // ✅ new field
      }
    ],
    default: []
  },
  externalVisitors: [
  {
 name: { type: String, required: true },
    email: { type: String },
    nationalId: { type: String, required: true },
    code: { type: String, required: true },
    qrCode: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }
]

}, { timestamps: true });

// ------------------- Pre-save middleware -------------------
bazaarSchema.pre("save", function (next) {
  const now = new Date();

  this.registeredVendors.forEach((vendor) => {
    // Calculate finalPrice if not set
    if (!vendor.finalPrice && this.startDate && this.endDate) {
      const msPerDay = 1000 * 60 * 60 * 24;
      const totalDays = Math.round((new Date(this.endDate) - new Date(this.startDate)) / msPerDay) + 1;
      const sizeMultiplier = vendor.boothSize === "4x4" ? 1.5 : 1;
      vendor.finalPrice = this.basePricePerDay * totalDays * sizeMultiplier;
    } else if (!vendor.finalPrice) {
      vendor.finalPrice = this.basePricePerDay;
    }

    // Set paymentDeadline 3 days after approval if approved and not already set
    if (vendor.status === 'approved' && vendor.paymentStatus === 'unpaid' && !vendor.paymentDeadline) {
      vendor.paymentDeadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
    }
  });

  next();
});

export const Bazaar = Event.discriminator('bazaar', bazaarSchema);
