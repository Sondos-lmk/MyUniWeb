import mongoose from 'mongoose';
import { Event } from './Event.js';
import Joi from 'joi';

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
        status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
        reps: [
          { _id: false,  
            name: { type: String, required: true },
            email: { type: String, required: true }
          }
        ],
         workers: [
          {
            name: { type: String, required: true },
            idPicture: { type: String, required: true }, // URL or path to uploaded ID image
            addedAt: { type: Date, default: Date.now }
          },
        ],
        boothSize: { type: String, enum: ['2x2','4x4'], required: true },
        finalPrice: { type: Number, required: true },
        paymentStatus: { type: String, enum: ['unpaid','paid'], default: 'unpaid' },
        paymentDeadline: { type: Date }, // ✅ new field
        workersSubmitted: { type: Boolean, default: false } // ✅ NEW FIELD
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

});

bazaarSchema.pre("save", function (next) {
  // Get the bazaar dates from the document level
  const bazaarStartDate = this.startDate;
  const bazaarEndDate = this.endDate;
  const basePricePerDay = this.basePricePerDay;

  this.registeredVendors.forEach((vendor) => {
    if (!vendor.finalPrice && bazaarStartDate && bazaarEndDate) {
      // Calculate total days across year boundaries
      let totalDays = 0;
      const currentDate = new Date(bazaarStartDate);
      const endDate = new Date(bazaarEndDate);

      while (currentDate <= endDate) {
        const currentYear = currentDate.getFullYear();
        const lastDayOfYear = new Date(currentYear, 11, 31);
        
        const periodEnd = endDate <= lastDayOfYear ? endDate : lastDayOfYear;
        
        const msPerDay = 1000 * 60 * 60 * 24;
        const daysInPeriod = Math.round((periodEnd.getTime() - currentDate.getTime()) / msPerDay) + 1;
        
        totalDays += daysInPeriod;
        
        currentDate.setFullYear(currentYear + 1, 0, 1);
      }

      const sizeMultiplier = vendor.boothSize === "4x4" ? 1.5 : 1;
      vendor.finalPrice = basePricePerDay * totalDays * sizeMultiplier;
    } else if (!vendor.finalPrice) {
      // Fallback if dates are missing
      vendor.finalPrice = basePricePerDay;
    }
  });
  next();
});

export const Bazaar = Event.discriminator('bazaar', bazaarSchema);