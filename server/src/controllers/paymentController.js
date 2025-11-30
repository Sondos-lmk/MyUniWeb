import { User } from '../models/Users/User.js';
import { Event } from '../models/Events/Event.js';
import { Bazaar } from '../models/Events/Bazaar.js';
import { Booth } from '../models/Events/Booth.js';
import { sendEmail } from '../utils/email.js';
import Stripe from 'stripe';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const __filename = fileURLToPath(import.meta.url);

// --- QR CODE GENERATION ---
const generateAndSaveQRCode = async (eventId, registrationId, vendorId) => {
  try {
    const qrDir = path.join(process.cwd(), 'uploads', 'qrcodes');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    const qrContent = JSON.stringify({
      eventId: eventId.toString(),
      registrationId: registrationId.toString(),
      vendorId: vendorId.toString(),
      timestamp: new Date().toISOString()
    });

    const filename = `qr_${registrationId}_${Date.now()}.png`;
    const filepath = path.join(qrDir, filename);

    await QRCode.toFile(filepath, qrContent, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' }
    });

    console.log(`✅ QR code saved: ${filepath}`);

    return {
      filepath,
      filename
    };
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// --- SEND QR EMAIL WITH ATTACHMENT ---
export const sendQRMail = async (eventId, registrationId, vendor) => {
  try {
    if (!vendor) return;

    const qrData = await generateAndSaveQRCode(eventId, registrationId, vendor._id);
    const vendorName = vendor.companyName || vendor.name || "Vendor";

    const html = `
      <div style="font-family: Arial; padding: 20px; line-height: 1.6">
        <h2 style="color: #004a99;">Your Payment is Confirmed ✔</h2>
        <p>Hi ${vendorName},</p>
        <p>Your booth payment has been received successfully.</p>
        <p>Please find your QR code attached to this email.</p>
        <p style="margin-top: 20px; color: #666; font-size: 0.9em;">
          <strong>Note:</strong> Save the attached QR code for event entry.
        </p>
        <p style="margin-top: 20px;">Thank you,<br/>Innovex Team</p>
      </div>
    `;

    await sendEmail({
      to: vendor.email,
      subject: "Your Booth QR Code – Payment Confirmed!",
      html,
      attachments: [
        {
          filename: qrData.filename,
          path: qrData.filepath, // full local path to file
          cid: 'qrcode' // optional, useful if you want to embed inline
        }
      ]
    });

    console.log("✅ QR mail sent with attachment to:", vendor.email);
    return qrData.filepath;

  } catch (err) {
    console.error("Error sending QR email:", err);
    throw err;
  }
};


// --- PAYMENT RECEIPTS ---
const sendPaymentReceipt = async (user, registration, paymentMethod) => {
  try {
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
              <td style="padding: 8px 0; text-align: right;">EGP ${amountPaid.toFixed(2)}</td>
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

    await sendEmail({
      to: user.email,
      subject: subject,
      html: html
    });
    
    console.log(`Payment receipt sent to ${user.email}`);
  
  } catch (emailError) {
    console.error(`Failed to send payment receipt to ${user.email}:`, emailError);
  }
};

const sendBazaarBoothPaymentReceipt = async (user, event, registration, paymentMethod) => {
  try {
    const eventTitle = event.title;
    const amountPaid = registration.finalPrice;
    const paymentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    const subject = `Payment Receipt for: ${eventTitle}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #004a99;">Payment Successful!</h2>
        <p>Hi ${user.companyName || user.name},</p>
        <p>This is a receipt for your booth payment for the event: <strong>${eventTitle}</strong>.</p>
        <hr style="border: 0; border-top: 1px solid #eee;">
        <h3 style="color: #333;">Payment Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0;"><strong>Amount Paid:</strong></td>
              <td style="padding: 8px 0; text-align: right;">EGP ${amountPaid.toFixed(2)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0;"><strong>Booth Size:</strong></td>
              <td style="padding: 8px 0; text-align: right;">${registration.boothSize}</td>
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
        <p style="margin-top: 20px;">Thank you for your payment! Your booth reservation is now confirmed.</p>
        <p style="font-size: 0.9em; color: #777;"><em>The Innovex Team</em></p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: subject,
      html: html
    });
    
    console.log(`Bazaar/Booth payment receipt sent to ${user.email}`);
  
  } catch (emailError) {
    console.error(`Failed to send bazaar/booth payment receipt to ${user.email}:`, emailError);
  }
};

// --- PAY WITH WALLET ---
export const payWithWallet = async (req, res) => {
  try {
    const { eventId } = req.body;
    const user = req.user;

    const registration = user.registeredEvents.find(
      (reg) => reg.event.equals(eventId)
    );

    if (!registration) {
      return res.status(404).json({ error: "Registration not found." });
    }

    if (registration.paymentStatus === 'paid') {
      return res.status(400).json({ error: "Already paid for this event." });
    }

    const priceToPay = registration.priceAtRegistration;

    if (typeof user.wallet !== 'number' || isNaN(user.wallet)) {
      user.wallet = 0;
    }

    if (user.wallet < priceToPay) {
      return res.status(400).json({ error: "Insufficient wallet balance." });
    }

    user.wallet -= priceToPay;
    registration.paymentStatus = 'paid';

    await user.save();

    await user.populate('registeredEvents.event');
    const populatedReg = user.registeredEvents.find(
      (reg) => reg.event && reg.event._id.equals(eventId)
    );

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

// --- REQUEST REFUND ---
export const requestRefund = async (req, res) => {
  try {
    const { eventId } = req.body;
    const user = req.user;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event details not found." });
    }

    const eventStartDate = new Date(event.startDate);
    const today = new Date();
    const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;

    if (eventStartDate.getTime() - today.getTime() < twoWeeksInMs) {
      return res.status(400).json({
        error: "Cancellation failed: The event is less than 2 weeks away."
      });
    }

    const regIndex = user.registeredEvents.findIndex(
      (reg) => reg.event.equals(eventId)
    );

    if (regIndex === -1) {
      return res.status(404).json({ error: "Registration not found in user profile." });
    }

    const registration = user.registeredEvents[regIndex];

    if (registration.paymentStatus === 'paid') {
      if (typeof user.wallet !== 'number' || isNaN(user.wallet)) {
        user.wallet = 0;
      }
      
      const refundAmount = registration.priceAtRegistration;
      user.wallet += refundAmount;

      user.walletTransactions.push({
        amount: refundAmount,
        type: "refund",
        description: `Refund for canceling ${event.title}`,
        date: new Date()
      });
    }

    const userId = user._id;
    if (event.registeredUsers && event.registeredUsers.includes(userId)) {
      event.registeredUsers = event.registeredUsers.filter(
        (id) => !id.equals(userId)
      );
    }
    if (event.registeredStudents && event.registeredStudents.includes(userId)) {
      event.registeredStudents = event.registeredStudents.filter(
        (id) => !id.equals(userId)
      );
    }
    await event.save();

    user.registeredEvents.splice(regIndex, 1);
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

export const getWallet = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      balance: user.wallet || 0,
      transactions: user.walletTransactions || []
    });

  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// --- CREATE STRIPE CHECKOUT ---
export const createStripeCheckout = async (req, res) => {
  try {
    const { eventId } = req.body;
    const user = req.user;

    const registration = user.registeredEvents.find(
      (reg) => reg.event.equals(eventId)
    );

    if (!registration) {
      return res.status(404).json({ error: "Registration not found." });
    }
    
    await user.populate('registeredEvents.event');
    const eventTitle = registration.event.title || 'University Event';
    const priceToPay = registration.priceAtRegistration;

    const priceInCents = Math.round(priceToPay * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'egp',
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
      metadata: {
        userId: user._id.toString(),
        eventId: eventId,
      },
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error("Error creating Stripe session:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// --- CREATE STRIPE CHECKOUT FOR BAZAAR/BOOTH ---
export const createBazaarBoothStripeCheckout = async (req, res) => {
  try {
    const { eventId, registrationId } = req.body;
    const user = req.user;

    console.log('Creating Stripe checkout for event:', { eventId, userId: user._id, registrationId });

    let event = await Bazaar.findById(eventId);
    let eventType = 'bazaar';

    if (!event) {
      event = await Booth.findById(eventId);
      eventType = 'booth';
    }

    if (!event) {
      return res.status(404).json({ error: "Event not found in either Bazaar or Booth." });
    }

    const registration = event.registeredVendors.find(
      (reg) => reg._id.toString() === registrationId.toString()
    );

    if (!registration) {
      return res.status(404).json({ error: "Vendor registration not found for this event." });
    }

    if (registration.paymentStatus === 'paid') {
      return res.status(400).json({ error: "This application has already been paid for." });
    }

    if (!registration.workersSubmitted) {
      return res.status(400).json({ error: "Workers information must be submitted before payment." });
    }

    const eventTitle = event.title;
    const finalPrice = registration.finalPrice;
    const priceInCents = Math.round(finalPrice * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'egp',
            product_data: {
              name: `${eventTitle} - Booth Rental`,
              description: `Booth application for ${eventTitle} (${registration.boothSize})`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL}/vendor/dashboard`,
      metadata: {
        userId: user._id.toString(),
        eventId: eventId,
        vendorId: user._id.toString(),
        eventType,
        registrationId: registration._id.toString()
      },
      customer_email: user.email,
    });

    res.json({
      url: session.url,
      sessionId: session.id
    });

  } catch (err) {
    console.error("Error creating Stripe session:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// --- STRIPE WEBHOOK HANDLER ---
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, eventId, registrationId } = session.metadata;

    try {
      console.log('Processing Stripe webhook for:', { userId, eventId, registrationId });

      let eventDoc = await Bazaar.findById(eventId);
      let eventKind = 'bazaar';

      if (!eventDoc) {
        eventDoc = await Booth.findById(eventId);
        eventKind = 'booth';
      }

      if (!eventDoc) {
        throw new Error(`Event not found in Bazaar or Booth for ID: ${eventId}`);
      }

      const registration = eventDoc.registeredVendors.id(registrationId);
      if (!registration) {
        throw new Error(`Vendor registration not found for registration ID: ${registrationId}`);
      }

      registration.paymentStatus = 'paid';
      await eventDoc.save({ validateBeforeSave: false });

      const user = await User.findById(userId);
      if (user) {
        // Generate and send QR code
        await sendQRMail(eventId, registrationId, user);

        // Send payment receipt
        await sendBazaarBoothPaymentReceipt(user, eventDoc, registration, 'Credit Card');

        await user.populate('registeredEvents.event');
        const populatedReg = user.registeredEvents.find(
          (reg) => reg.event && reg.event._id.equals(eventId)
        );

        if (populatedReg && populatedReg.event) {
          await sendPaymentReceipt(user, populatedReg, 'Credit Card');
        } else {
          console.warn(`⚠️ Event ${eventId} was deleted, skipping payment receipt`);
        }
      }

      console.log(`✅ Payment recorded for ${eventKind} ${eventId} and registration ${registrationId}`);

    } catch (err) {
      console.error('❌ Error updating after Stripe payment:', err);
      return res.status(500).json({ error: 'Database update failed.', details: err.message });
    }
  }

  res.json({ received: true });
};