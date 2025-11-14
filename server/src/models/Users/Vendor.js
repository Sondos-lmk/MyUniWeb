import mongoose from 'mongoose';
import { User } from './User.js';

const vendorSchema = new mongoose.Schema({
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
  companyName: { type: String, required: true },
  appliedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'events' }],
   taxDocument: { type: String }, // stored file path or URL
  logo: { type: String }, // stored file path or URL
  // === Loyalty Program Fields ===
   isLoyaltyPartner: {type: Boolean,default: false},
   loyaltyDiscountPercent: {type: Number,min: 0,max: 100,default: 0},
   loyaltyPromoCode: {type: String,default: ""},
   loyaltyTerms: {type: String,default: ""},
});

export const Vendor = User.discriminator('vendor', vendorSchema); 
