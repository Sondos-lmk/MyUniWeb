import { User } from '../models/Users/User.js'; // Import base User model
import { Event } from '../models/Events/Event.js';
import { sendEmail } from '../utils/email.js';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
import dotenv from "dotenv";
dotenv.config();



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// --- NEW: PAYMENT RECEIPT HELPER FUNCTION ---
/**
 * Sends a payment receipt email to the user.
 * @param {object} user - The full user Mongoose document.
 * @param {object} registration - The specific registration object.
 * @param {string} paymentMethod - e.g., "Wallet" or "Credit Card".
 */
// controllers/paymentController.js

const sendPaymentReceipt = async (user, registration, paymentMethod) => {
  try {
    // We must ensure the event details are populated
    if (!registration.event) {
      throw new Error("Cannot send receipt; associated event not found.");
    }

    const eventTitle = registration.event.title;
    const amountPaid = registration.priceAtRegistration;
    const paymentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    const subject = `Payment Receipt for: ${eventTitle}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #004a99;">Payment Successful!</h2>
        <p>Hi ${user.name},</p>
        <p>This is a receipt for your payment for the event: <strong>${eventTitle}</strong>.</p>
        <hr style="border: 0; border-top: 1px solid #eee;">
        <h3 style="color: #333;">Payment Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0;"><strong>Amount Paid:</strong></td>
              <td style="padding: 8px 0; text-align: right;">$${amountPaid.toFixed(2)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0;"><strong>Payment Method:</strong></td>
              <td style="padding: 8px 0; text-align: right;">${paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Payment Date:</strong></td>
              <td style="padding: 8px 0; text-align: right;">${paymentDate}</td>
            </tr>
          </tbody>
        </table>
        <hr style="border: 0; border-top: 1px solid #eee;">
        <p style="margin-top: 20px;">Thank you for your registration!</p>
        <p style="font-size: 0.9em; color: #777;"><em>The Innovex Team</em></p>
      </div>
    `;

    // --- SEND TO USER'S ACTUAL EMAIL ---
    await sendEmail({
      to: user.email,
      subject: subject,
      html: html
    });
    
    console.log(`Payment receipt sent to ${user.email}`);
  
  } catch (emailError) {
    // We log the *full* error to see what went wrong
    console.error(`Failed to send payment receipt to ${user.email}:`, emailError);
  }
};

// --- 1. PAY WITH WALLET ---

export const payWithWallet = async (req, res) => {
  try {
    const { eventId } = req.body;
    // req.user is the full Mongoose doc (Student, Professor, etc.)
    const user = req.user; 

    // Find the event in the user's registered list
    const registration = user.registeredEvents.find(
      (reg) => reg.event.equals(eventId)
    );

    if (!registration) {
      return res.status(404).json({ error: "Registration not found." });
    }

    // Check payment status
    if (registration.paymentStatus === 'paid') {
      return res.status(400).json({ error: "Already paid for this event." });
    }

    // Get the price from when they registered
    const priceToPay = registration.priceAtRegistration;

    // Ensure wallet is initialized (default to 0 if undefined)
    if (typeof user.wallet !== 'number' || isNaN(user.wallet)) {
      user.wallet = 0;
    }

    // Check wallet balance
    if (user.wallet < priceToPay) {
      return res.status(400).json({ error: "Insufficient wallet balance." });
    }

    // Perform the transaction
    user.wallet -= priceToPay;
    registration.paymentStatus = 'paid';

    // Save the user document
    await user.save();

    await user.populate('registeredEvents.event');
    // Find the registration object again (now populated)
    const populatedReg = user.registeredEvents.find(
      (reg) => reg.event && reg.event._id.equals(eventId)
    );

    // Only send receipt if event still exists
    if (populatedReg && populatedReg.event) {
      sendPaymentReceipt(user, populatedReg, 'Wallet');
    } else {
      console.warn(`⚠️ Event ${eventId} was deleted, skipping payment receipt`);
    }

    res.status(200).json({ 
      message: "Payment successful!",
      newBalance: user.wallet
    });

  } catch (err) {
    console.error("Error paying with wallet:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// --- 2. REQUEST REFUND (from Wallet) ---

// controllers/paymentController.js

export const requestRefund = async (req, res) => {
  try {
    const { eventId } = req.body;
    const user = req.user; // This is the Mongoose doc

    // 1. Find the event to check its date
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event details not found." });
    }

    // 2. The 2-Week Business Rule (Server-side check)
    const eventStartDate = new Date(event.startDate);
    const today = new Date();
    const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds

    if (eventStartDate.getTime() - today.getTime() < twoWeeksInMs) {
      return res.status(400).json({ 
        error: "Cancellation failed: The event is less than 2 weeks away." 
      });
    }

    // 3. Find the registration in the user's array
    const regIndex = user.registeredEvents.findIndex(
      (reg) => reg.event.equals(eventId)
    );

    if (regIndex === -1) {
      return res.status(404).json({ error: "Registration not found in user profile." });
    }
    
    // Get the specific registration object
    const registration = user.registeredEvents[regIndex];

    // 4. Process refund (if they paid)
    if (registration.paymentStatus === 'paid') {
      // Ensure wallet is initialized
      if (typeof user.wallet !== 'number' || isNaN(user.wallet)) {
        user.wallet = 0;
      }
      user.wallet += registration.priceAtRegistration;
    }

    // 5. Remove (cancel) the registration from the array
    user.registeredEvents.splice(regIndex, 1);

    // 6. Save the user document
    await user.save();

    res.status(200).json({ 
      message: "Cancellation and refund successful!",
      newBalance: user.wallet
    });

  } catch (err) {
    console.error("Error processing refund/cancellation:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// --- 3. CREATE STRIPE CHECKOUT SESSION ---

export const createStripeCheckout = async (req, res) => {
  try {
    const { eventId } = req.body;
    const user = req.user;

    // Find the registration to get the price
    const registration = user.registeredEvents.find(
      (reg) => reg.event.equals(eventId)
    );

    if (!registration) {
      return res.status(404).json({ error: "Registration not found." });
    }
    
    // Find the event itself (by populating) to get its name
    // We need to populate the event details to get the title
    await user.populate('registeredEvents.event');
    const eventTitle = registration.event.title || 'University Event';
    const priceToPay = registration.priceAtRegistration;

    // Stripe requires the price in cents
    const priceInCents = Math.round(priceToPay * 100);

    // Create a new checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'egp', // Change to your currency
            product_data: {
              name: eventTitle,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL}/my-registered-events`,
      // Add metadata to link the payment to our user and event
      metadata: {
        userId: user._id.toString(),
        eventId: eventId,
      },
    });

    // Send the session URL to the frontend
    res.json({ url: session.url });

  } catch (err) {
    console.error("Error creating Stripe session:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// --- 4. STRIPE WEBHOOK HANDLER ---

export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // req.rawBody is provided by the special middleware
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the 'checkout.session.completed' event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Get our metadata
    const { userId, eventId } = session.metadata;

    try {
      // Find the user (using the base User model is fine)
      const user = await User.findById(userId);
      if (!user) {
        throw new Error(`User not found with ID: ${userId}`);
      }

      // Find the registration
      const registration = user.registeredEvents.find(
        (reg) => reg.event.equals(eventId)
      );
      if (!registration) {
        throw new Error(`Registration not found for event: ${eventId}`);
      }

      // Update payment status
      registration.paymentStatus = 'paid';
      console.log(registration)
      await user.save();

      await user.populate('registeredEvents.event');
        // Find the populated registration
        const populatedReg = user.registeredEvents.find(
          (reg) => reg.event && reg.event._id.equals(eventId)
        );

      // Only send receipt if event still exists
      if (populatedReg && populatedReg.event) {
        sendPaymentReceipt(user, populatedReg, 'Credit Card');
      } else {
        console.warn(`⚠️ Event ${eventId} was deleted, skipping payment receipt`);
      }
      
      console.log(`Successfully updated payment for user ${userId} and event ${eventId}`);

    } catch (err) {
      console.error('Error updating database after Stripe payment:', err);
      // If we fail here, Stripe will retry.
      // Return 500 so Stripe knows something went wrong on our end.
      return res.status(500).json({ error: 'Database update failed.' });
    }
  }

  // Acknowledge receipt of the event
  res.json({ received: true });
};