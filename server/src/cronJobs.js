import mongoose from 'mongoose';
import { Booth } from './models/Events/Booth.js';
import { Bazaar } from './models/Events/Bazaar.js';

export const rejectOverduePayments = async () => {
  const now = new Date();

  // ---------------- Reject overdue booths ----------------
  const booths = await Booth.find({
    "registeredVendors.status": "approved",
    "registeredVendors.paymentStatus": "unpaid",
    "registeredVendors.paymentDeadline": { $lt: now },
  });

  for (const booth of booths) {
    let updated = false;

    booth.registeredVendors.forEach((vendor) => {
      if (
        vendor.status === 'approved' &&
        vendor.paymentStatus === 'unpaid' &&
        vendor.paymentDeadline < now
      ) {
        vendor.status = 'rejected';
        updated = true;
      }
    });

    if (updated) await booth.save();
  }

  // ---------------- Reject overdue bazaars ----------------
  const bazaars = await Bazaar.find({
    "registeredVendors.status": "approved",
    "registeredVendors.paymentStatus": "unpaid",
    "registeredVendors.paymentDeadline": { $lt: now },
  });

  for (const bazaar of bazaars) {
    let updated = false;

    bazaar.registeredVendors.forEach((vendor) => {
      if (
        vendor.status === 'approved' &&
        vendor.paymentStatus === 'unpaid' &&
        vendor.paymentDeadline < now
      ) {
        vendor.status = 'rejected';
        updated = true;
      }
    });

    if (updated) await bazaar.save();
  }

  console.log('✅ Overdue unpaid registrations checked and rejected.');
};
