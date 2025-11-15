import express from 'express';
import { 
  payWithWallet, 
  requestRefund, 
  createStripeCheckout, 
  stripeWebhook ,
  getWallet,
  createBazaarBoothStripeCheckout
  
} from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// --- SPECIAL WEBHOOK ROUTE ---
// This route MUST use express.raw() to get the raw request body
// for Stripe's signature verification.
// Place this route first, and do NOT use 'requireAuth'.
// router.post(
//   '/stripe-webhook', 
//   express.raw({ type: 'application/json' }), 
//   stripeWebhook
// );

// --- WALLET ROUTES ---
// These routes are for authenticated users

// Pay for an event using the internal wallet
router.post('/pay-with-wallet', requireAuth, payWithWallet);

// Request a refund for an event back to the internal wallet
router.post('/request-refund', requireAuth, requestRefund);
router.get("/wallet", requireAuth, getWallet);


// --- STRIPE CHECKOUT ROUTE ---
// This route is for authenticated users to start a card payment
router.post('/create-stripe-checkout', requireAuth, createStripeCheckout);

// Bazaar/Booth payments
router.post('/create-bazaar-booth-checkout', requireAuth, createBazaarBoothStripeCheckout);


export default router;