import express from 'express';
import { 
  payWithWallet, 
  requestRefund, 
  createStripeCheckout, 
  stripeWebhook ,
  getWallet,
  createBazaarBoothStripeCheckout,
  joinWaitlist,
  checkWaitlistSpot,
  validateReferralCode
  
} from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// --- WALLET ROUTES ---
// These routes are for authenticated users

// Pay for an event using the internal wallet
router.post('/pay-with-wallet', requireAuth, payWithWallet);

// Request a refund for an event back to the internal wallet
router.post('/request-refund', requireAuth, requestRefund);
router.get("/wallet", requireAuth, getWallet);

// Join waitlist for full events
router.post('/join-waitlist', requireAuth, joinWaitlist);

// Check if waitlist spot is available
router.get('/waitlist/:eventId/check', requireAuth, checkWaitlistSpot);

// Validate referral code before payment (authenticated)
router.post('/validate-referral', requireAuth, validateReferralCode);

// Validate referral code from URL (public - no auth required)
router.post('/check-referral', validateReferralCode);


// --- STRIPE CHECKOUT ROUTE ---
// This route is for authenticated users to start a card payment
router.post('/create-stripe-checkout', requireAuth, createStripeCheckout);

// Bazaar/Booth payments
router.post('/create-bazaar-booth-checkout', requireAuth, createBazaarBoothStripeCheckout);


export default router;