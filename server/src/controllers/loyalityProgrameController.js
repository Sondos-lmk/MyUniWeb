import { LoyaltyProgram } from '../models/Events/LoyaltyProgram.js';
import { Vendor } from '../models/Users/Vendor.js'; // Import Vendor to check role
import {Student} from "../models/Users/Student.js";
import {Staff} from "../models/Users/Staff.js";
import {TA} from "../models/Users/TA.js";
import {Professor} from "../models/Users/Professor.js";

// Helper function to check for vendor role
const isVendor = (user) => {
  if (user.role !== 'vendor') {
    return false;
  }
  return true;
};

/**
 * Story 1: Apply to participate in GUC loyalty program
 */
export const applyToLoyaltyProgram = async (req, res) => {
  try {
    if (!isVendor(req.user)) {
      return res.status(403).json({ error: 'Only vendors can apply to the loyalty program.' });
    }

    const vendorId = req.user._id;
    const { discountRate, promoCode, termsAndConditions } = req.body;

    // Check for required fields
    if (!discountRate || !promoCode) {
      return res.status(400).json({ error: 'Discount rate, promo code, and terms are required.' });
    }

    // Check if vendor is already in the program
    const existingEntry = await LoyaltyProgram.findOne({ vendor: vendorId });
    if (existingEntry) {
      return res.status(400).json({ error: 'You are already a participant in the loyalty program.' });
    }

    // Check if promo code is already taken
    const promoCodeTaken = await LoyaltyProgram.findOne({ promoCode });
    if (promoCodeTaken) {
      return res.status(400).json({ error: 'This promo code is already in use. Please choose another one.' });
    }

    // Create and save the new loyalty program entry
    const newEntry = new LoyaltyProgram({
      vendor: vendorId,
      discountRate,
      promoCode,
      termsAndConditions,
    });

    await newEntry.save();
    const msg = `New Loyalty Partner Added: Vendor ${req.user.companyName || req.user.name} is now in GUC Loyalty Program with promo code ${promoCode}.`;

    await Student.updateMany({}, {
      $push: { notifications: { message: msg } }
    });

    await Staff.updateMany({}, {
      $push: { notifications: { message: msg } }
    });

    await TA.updateMany({}, {
      $push: { notifications: { message: msg } }
    });

    await Professor.updateMany({}, {
      $push: { notifications: { message: msg } }
    });


    res.status(201).json({ message: 'Successfully applied to the loyalty program!', entry: newEntry });

  } catch (err) {
    console.error("Error applying to loyalty program:", err);
    if (err.code === 11000) { // Handle duplicate key error
      return res.status(400).json({ error: 'This promo code is already in use.' });
    }
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

/**
 * Story 2: Cancel participation in GUC loyalty program
 */
export const cancelLoyaltyProgram = async (req, res) => {
  try {
    if (!isVendor(req.user)) {
      return res.status(403).json({ error: 'Only vendors can cancel participation.' });
    }

    const vendorId = req.user._id;

    // Find the vendor's entry
    const entry = await LoyaltyProgram.findOne({ vendor: vendorId });
    if (!entry) {
      return res.status(404).json({ error: "You are not currently in the loyalty program." });
    }

    // Remove the entry
    await LoyaltyProgram.deleteOne({ _id: entry._id });

    res.status(200).json({ message: 'You have successfully cancelled your participation.' });

  } catch (err) {
    console.error("Error cancelling loyalty program:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

/**
 * Helper: Get the vendor's current loyalty status
 */
export const getMyLoyaltyStatus = async (req, res) => {
  try {
    if (!isVendor(req.user)) {
      return res.status(403).json({ error: 'Only vendors have loyalty status.' });
    }

    const vendorId = req.user._id;
    const entry = await LoyaltyProgram.findOne({ vendor: vendorId });

    if (!entry) {
      return res.status(200).json(null); // Return null if not in program
    }

    res.status(200).json(entry);

  } catch (err) {
    console.error("Error getting loyalty status:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};