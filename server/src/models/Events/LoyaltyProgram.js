import mongoose from 'mongoose';

const loyaltyProgramSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', // Refers to the base 'User' model
    required: true,
    unique: true, // A vendor can only have one entry
  },
  discountRate: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  promoCode: {
    type: String,
    required: true,
    unique: true, // Each promo code must be unique
    trim: true,
  },
  termsAndConditions: {
    type: String,
    default : ""
  },
}, { timestamps: true });

export const LoyaltyProgram = mongoose.model('LoyaltyProgram', loyaltyProgramSchema);