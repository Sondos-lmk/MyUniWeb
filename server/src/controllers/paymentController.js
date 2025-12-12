import { User } from '../models/Users/User.js';
import { Event } from '../models/Events/Event.js';
import { Bazaar } from '../models/Events/Bazaar.js';
import { Booth } from '../models/Events/Booth.js';
import { sendEmail } from '../utils/email.js';
import { generateReferralCode } from '../utils/referralUtils.js';
import Stripe from 'stripe';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

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
const sendPaymentReceipt = async (user, registration, paymentMethod, referralLink = null) => {
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
    
    const referralSection = referralLink ? `
      <hr style="border: 0; border-top: 1px solid #eee; margin-top: 20px;">
      <h3 style="color: #004a99;">🎁 Share & Earn!</h3>
      <p>Invite your friends to this event and both of you will receive <strong>15% credit to your wallet</strong> after the cancellation deadline!</p>
      <p style="margin: 15px 0;">
        <strong>Your Referral Link:</strong><br/>
        <a href="${referralLink}" style="color: #004a99; word-break: break-all;">${referralLink}</a>
      </p>
      <p style="font-size: 0.9em; color: #666;">
        • Share this link with your friend<br/>
        • They must register and pay for the same event<br/>
        • Both you and your friend get 15% back after the 2-week cancellation deadline<br/>
        • Rewards are void if either party cancels
      </p>
    ` : '';
    
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
        ${referralSection}
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
    const { eventId, referralCode } = req.body;
    const user = req.user;
    const userId = user._id;

    const registration = user.registeredEvents.find(
      (reg) => reg.event.equals(eventId)
    );

    if (!registration) {
      return res.status(404).json({ error: "Registration not found." });
    }

    if (registration.paymentStatus === 'paid') {
      return res.status(400).json({ error: "Already paid for this event." });
    }

    // 🆕 WAITLIST RACE CONDITION HANDLING
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    // 🔗 REFERRAL VALIDATION - Check if referral code is provided and valid
    let referrerUserId = null;
    if (referralCode) {
      // Convert eventId to ObjectId for proper comparison
      const eventObjectId = new mongoose.Types.ObjectId(eventId);
      
      // Find the referrer by searching for a user with this referral code for this event
      const allUsers = await User.find({
        'registeredEvents': {
          $elemMatch: {
            event: eventObjectId,
            referralCode: referralCode,
            paymentStatus: 'paid'
          }
        }
      });

      if (allUsers.length === 0) {
        return res.status(400).json({ 
          error: "Invalid referral code. The person who shared this link may not have paid yet, or the code is for a different event." 
        });
      }

      const referrer = allUsers[0];
      referrerUserId = referrer._id;

      // Check if referrer is trying to use their own code
      if (referrerUserId.equals(userId)) {
        return res.status(400).json({ error: "You cannot use your own referral code." });
      }

      // Check if this code has reached max usage (1)
      const usageCount = event.referrals.filter(
        ref => ref.referralCode === referralCode
      ).length;

      if (usageCount >= 1) {
        return res.status(400).json({ 
          error: "This referral code has already been used." 
        });
      }

      // Check if user already used a referral for this event
      const alreadyUsedReferral = event.referrals.some(
        ref => ref.referredUserId.equals(userId)
      );

      if (alreadyUsedReferral) {
        return res.status(400).json({ 
          error: "You have already used a referral code for this event." 
        });
      }
    }

    // Check if user was on waitlist
    const wasOnWaitlist = registration.paymentStatus === 'waitlisted';
    
    if (wasOnWaitlist) {
      // Check if event is still full
      const maxParticipants = event.maxParticipants || event.capacity || 0;
      const currentRegistrations = event.registeredUsers?.length || 0;
      
      if (currentRegistrations >= maxParticipants) {
        return res.status(400).json({ 
          error: "Sorry, the spot was already taken by another user. You remain on the waitlist.",
          spotTaken: true 
        });
      }

      // Check if user is still on waitlist
      const stillOnWaitlist = event.waitlist?.some(
        (entry) => entry.user.equals(userId)
      );
      
      if (!stillOnWaitlist) {
        return res.status(400).json({ 
          error: "You are no longer on the waitlist for this event.",
          spotTaken: true 
        });
      }
    } else {
      // 🆕 FOR REGULAR REGISTRATIONS: Check if event became full before payment
      const maxParticipants = event.maxParticipants || event.capacity || 0;
      const currentPaidUsers = event.registeredUsers?.length || 0;
      
      if (maxParticipants > 0 && currentPaidUsers >= maxParticipants) {
        return res.status(400).json({ 
          error: "This event has reached maximum capacity and is now full.",
          spotTaken: true 
        });
      }
    }

    const priceToPay = registration.priceAtRegistration;

    if (typeof user.wallet !== 'number' || isNaN(user.wallet)) {
      user.wallet = 0;
    }

    if (user.wallet < priceToPay) {
      return res.status(400).json({ error: "Insufficient wallet balance." });
    }

    // Process payment
    user.wallet -= priceToPay;
    registration.paymentStatus = 'paid';

    // 🆕 Add user to event's registeredUsers if not already there
    if (wasOnWaitlist) {
      // Remove from waitlist
      event.waitlist = event.waitlist.filter(
        (entry) => !entry.user.equals(userId)
      );
      
      // Add to registered users
      if (!event.registeredUsers) event.registeredUsers = [];
      if (!event.registeredUsers.includes(userId)) {
        event.registeredUsers.push(userId);
      }
      
      await event.save();
      console.log(`✅ User ${userId} moved from waitlist to registered for event ${eventId}`);
    } else {
      // 🆕 FOR REGULAR USERS: Add to registeredUsers when they pay
      if (!event.registeredUsers) event.registeredUsers = [];
      if (!event.registeredUsers.some(id => id.equals(userId))) {
        event.registeredUsers.push(userId);
        await event.save();
        console.log(`✅ User ${userId} added to registeredUsers for event ${eventId}`);
      }
    }

    await user.save();

    // 🔗 Track referral relationship if referral code was used
    if (referrerUserId) {
      registration.referredBy = referrerUserId;
      event.referrals.push({
        referrerUserId: referrerUserId,
        referredUserId: userId,
        referralCode: referralCode,
        referrerPaid: true,
        referredPaid: true,
        rewardGranted: false,
        createdAt: new Date()
      });
      await event.save();
      await user.save();
      console.log(`✅ Referral tracked: ${referrerUserId} referred ${userId} for event ${eventId}`);
    }

    // 🔗 Generate referral code ONLY if user did NOT use a referral (they're the original payer)
    let referralLink = null;
    if (!referrerUserId) {
      // User paid without a referral code, so they get their own referral link
      const userReferralCode = generateReferralCode(userId.toString(), eventId.toString());
      registration.referralCode = userReferralCode;
      await user.save();

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5000';
      referralLink = `${clientUrl}/login?ref=${userReferralCode}&eventId=${eventId}`;
      console.log(`✅ Referral link generated for original payer: ${referralLink}`);
    } else {
      console.log(`ℹ️ User used a referral code, so no referral link generated for them`);
    }

    await user.populate('registeredEvents.event');
    const populatedReg = user.registeredEvents.find(
      (reg) => reg.event && reg.event._id.equals(eventId)
    );

    if (populatedReg && populatedReg.event) {
      sendPaymentReceipt(user, populatedReg, 'Wallet', referralLink);
    } else {
      console.warn(`⚠️ Event ${eventId} was deleted, skipping payment receipt`);
    }

    res.status(200).json({ 
      message: "Payment successful!",
      newBalance: user.wallet,
      wasWaitlisted: wasOnWaitlist
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

    const event = await Event.findById(eventId).populate('waitlist.user', 'email name');
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

    // 🆕 NOTIFY WAITLISTED USERS
    if (event.waitlist && event.waitlist.length > 0) {
      console.log(`📧 Notifying ${event.waitlist.length} waitlisted users about available spot`);
      
      const emailPromises = event.waitlist.map(async (entry) => {
        const waitlistedUser = entry.user;
        if (!waitlistedUser || !waitlistedUser.email) return;

        const html = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #004a99;"> A Spot Opened Up!</h2>
            <p>Hi ${waitlistedUser.name},</p>
            <p>Great news! A spot has become available for the event you're waitlisted for:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin: 0; color: #333;">${event.title}</h3>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p style="margin: 5px 0;"><strong>Price:</strong> EGP ${event.price?.toFixed(2) || '0.00'}</p>
            </div>
            <p><strong>⚡ First to pay gets the spot!</strong></p>
            <p>Log in to your account and complete payment to secure your registration.</p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
                 style="background-color: #004a99; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Log In to Register
              </a>
            </div>
            <p style="font-size: 0.9em; color: #777; margin-top: 20px;">
              <em>Note: This spot is available on a first-come, first-served basis. Act quickly!</em>
            </p>
            <p style="margin-top: 20px;">Best regards,<br/>The Innovex Team</p>
          </div>
        `;

        try {
          await sendEmail({
            to: waitlistedUser.email,
            subject: `Spot Available: ${event.title}`,
            html: html
          });
          console.log(`✅ Waitlist notification sent to ${waitlistedUser.email}`);
        } catch (emailError) {
          console.error(`❌ Failed to send waitlist email to ${waitlistedUser.email}:`, emailError);
        }
      });

      // Send all emails in parallel
      await Promise.allSettled(emailPromises);
    }

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

// --- JOIN WAITLIST ---
export const joinWaitlist = async (req, res) => {
  try {
    const { eventId } = req.body;
    const user = req.user;
    const userId = user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    // Check if event is actually full
    const maxParticipants = event.maxParticipants || event.capacity || 0;
    const currentRegistrations = event.registeredUsers?.length || 0;
    
    if (currentRegistrations < maxParticipants) {
      return res.status(400).json({ error: "Event is not full. Please register normally." });
    }

    // Check if user already registered for the event
    const alreadyRegistered = user.registeredEvents?.some(
      (reg) => reg.event.equals(eventId)
    );
    if (alreadyRegistered) {
      return res.status(400).json({ error: "You are already registered for this event." });
    }

    // Check if user already on waitlist
    event.waitlist = event.waitlist || [];
    const alreadyOnWaitlist = event.waitlist.some(
      (entry) => entry.user.equals(userId)
    );
    if (alreadyOnWaitlist) {
      return res.status(400).json({ error: "You are already on the waitlist for this event." });
    }

    // Add user to waitlist
    event.waitlist.push({
      user: userId,
      joinedAt: new Date()
    });
    await event.save();
    console.log(`✅ Added user ${userId} to event ${eventId} waitlist`);

    // Add waitlist entry to user's registered events with special status
    user.registeredEvents = user.registeredEvents || [];
    user.registeredEvents.push({
      event: eventId,
      paymentStatus: 'waitlisted',
      priceAtRegistration: event.price || 0
    });
    
    console.log(`📝 Adding waitlisted event to user.registeredEvents:`, {
      event: eventId,
      paymentStatus: 'waitlisted',
      priceAtRegistration: event.price || 0
    });
    
    await user.save();
    console.log(`✅ User saved successfully with ${user.registeredEvents.length} registered events`);

    res.status(200).json({
      message: "Successfully joined the waitlist! You'll be notified if a spot opens up.",
      waitlistPosition: event.waitlist.length
    });

  } catch (err) {
    console.error("Error joining waitlist:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// --- CREATE STRIPE CHECKOUT ---
export const createStripeCheckout = async (req, res) => {
  try {
    const { eventId, referralCode } = req.body;
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

    const metadata = {
      userId: user._id.toString(),
      eventId: eventId,
    };

    // Add referral code to metadata if provided
    if (referralCode) {
      metadata.referralCode = referralCode;
    }

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
      metadata: metadata,
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
    const { userId, eventId, registrationId, referralCode } = session.metadata;

    try {
      console.log('Processing Stripe webhook for:', { userId, eventId, registrationId, referralCode });

      // Check if this is a VENDOR payment (Bazaar/Booth) or STUDENT event payment
      if (registrationId) {
        // ===== VENDOR PAYMENT (Bazaar/Booth) =====
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
        }

        console.log(`✅ Vendor payment recorded for ${eventKind} ${eventId} and registration ${registrationId}`);

      } else {
        // ===== STUDENT EVENT PAYMENT =====
        const user = await User.findById(userId);
        if (!user) {
          throw new Error(`User not found for ID: ${userId}`);
        }

        const registration = user.registeredEvents.find(
          (reg) => reg.event.toString() === eventId
        );

        if (!registration) {
          throw new Error(`Registration not found for user ${userId} and event ${eventId}`);
        }

        // 🆕 WAITLIST RACE CONDITION HANDLING FOR STRIPE
        const eventDoc = await Event.findById(eventId);
        if (!eventDoc) {
          throw new Error(`Event not found for ID: ${eventId}`);
        }

        const wasOnWaitlist = registration.paymentStatus === 'waitlisted';
        
        if (wasOnWaitlist) {
          // Check if event is still full
          const maxParticipants = eventDoc.maxParticipants || eventDoc.capacity || 0;
          const currentRegistrations = eventDoc.registeredUsers?.length || 0;
          
          if (currentRegistrations >= maxParticipants) {
            console.log(`⚠️ Spot taken for event ${eventId}, payment will be refunded`);
            // In a real scenario, you'd want to refund the Stripe payment here
            throw new Error('Spot was already taken by another user');
          }

          // Remove from waitlist and add to registered users
          eventDoc.waitlist = eventDoc.waitlist?.filter(
            (entry) => !entry.user.equals(userId)
          ) || [];
          
          if (!eventDoc.registeredUsers) eventDoc.registeredUsers = [];
          if (!eventDoc.registeredUsers.some(id => id.equals(userId))) {
            eventDoc.registeredUsers.push(userId);
          }
          
          await eventDoc.save();
          console.log(`✅ User ${userId} moved from waitlist to registered for event ${eventId}`);
        } else {
          // 🆕 FOR REGULAR USERS: Check capacity and add to registeredUsers
          const maxParticipants = eventDoc.maxParticipants || eventDoc.capacity || 0;
          const currentRegistrations = eventDoc.registeredUsers?.length || 0;
          
          if (maxParticipants > 0 && currentRegistrations >= maxParticipants) {
            console.log(`⚠️ Event full for ${eventId}, payment will be refunded`);
            throw new Error('Event has reached maximum capacity');
          }
          
          // Add to registered users
          if (!eventDoc.registeredUsers) eventDoc.registeredUsers = [];
          if (!eventDoc.registeredUsers.some(id => id.equals(userId))) {
            eventDoc.registeredUsers.push(userId);
            await eventDoc.save();
            console.log(`✅ User ${userId} added to registeredUsers for event ${eventId}`);
          }
        }

        // Mark as paid
        registration.paymentStatus = 'paid';
        await user.save(); // ✅ CRITICAL: Save the payment status change!
        
        // 🔗 Handle referral tracking if referral code was used
        let referrerUserId = null;
        if (referralCode) {
          // Convert eventId to ObjectId for proper comparison
          const eventObjectId = new mongoose.Types.ObjectId(eventId);
          
          const allUsers = await User.find({
            'registeredEvents': {
              $elemMatch: {
                event: eventObjectId,
                referralCode: referralCode,
                paymentStatus: 'paid'
              }
            }
          });

          if (allUsers.length > 0) {
            referrerUserId = allUsers[0]._id;
            
            // Check if user is trying to use their own code
            if (referrerUserId.equals(userId)) {
              referrerUserId = null; // Don't track self-referral
            } else {
              // Check if this code has reached max usage (1)
              const usageCount = eventDoc.referrals.filter(
                ref => ref.referralCode === referralCode
              ).length;

              if (usageCount >= 1) {
                referrerUserId = null; // Don't track referral
              } else if (eventDoc.referrals.some(ref => ref.referredUserId.equals(userId))) {
                referrerUserId = null; // Don't track duplicate referral
              } else {
                // Track referral relationship
                registration.referredBy = referrerUserId;
                eventDoc.referrals.push({
                  referrerUserId: referrerUserId,
                  referredUserId: userId,
                  referralCode: referralCode,
                  referrerPaid: true,
                  referredPaid: true,
                  rewardGranted: false,
                  createdAt: new Date()
                });
                await eventDoc.save();
              }
            }
          }
        }

        // 🔗 Generate referral code ONLY if user did NOT use a referral (they're the original payer)
        let referralLink = null;
        if (!referralCode) {
          // User paid without a referral code, so they get their own referral link
          const userReferralCode = generateReferralCode(userId.toString(), eventId);
          registration.referralCode = userReferralCode;
          
          await user.save();

          const clientUrl = process.env.CLIENT_URL || 'http://localhost:5000';
          referralLink = `${clientUrl}/login?ref=${userReferralCode}&eventId=${eventId}`;
          console.log(`✅ Referral link generated for original payer (Stripe): ${referralLink}`);
        } else {
          console.log(`ℹ️ User used a referral code (Stripe), so no referral link generated for them`);
        }

        // Send payment receipt
        await user.populate('registeredEvents.event');
        const populatedReg = user.registeredEvents.find(
          (reg) => reg.event && reg.event._id.toString() === eventId
        );

        if (populatedReg && populatedReg.event) {
          await sendPaymentReceipt(user, populatedReg, 'Credit Card', referralLink);
        } else {
          console.warn(`⚠️ Event ${eventId} was deleted, skipping payment receipt`);
        }

        console.log(`✅ Student event payment recorded for user ${userId} and event ${eventId}`);
      }

    } catch (err) {
      console.error('❌ Error updating after Stripe payment:', err);
      return res.status(500).json({ error: 'Database update failed.', details: err.message });
    }
  }

  res.json({ received: true });
};

// --- CHECK IF WAITLIST SPOT IS AVAILABLE ---
export const checkWaitlistSpot = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // Check if user is on waitlist
    const isOnWaitlist = event.waitlist?.some(
      (entry) => entry.user.equals(userId)
    );

    if (!isOnWaitlist) {
      return res.status(200).json({ 
        isOnWaitlist: false,
        spotAvailable: false 
      });
    }

    // Check if spot is available
    const maxParticipants = event.maxParticipants || event.capacity || 0;
    const currentRegistrations = event.registeredUsers?.length || 0;
    const spotAvailable = currentRegistrations < maxParticipants;

    res.status(200).json({
      isOnWaitlist: true,
      spotAvailable,
      eventTitle: event.title,
      currentRegistrations,
      maxParticipants
    });

  } catch (err) {
    console.error('Error checking waitlist spot:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// --- VALIDATE REFERRAL CODE ---
export const validateReferralCode = async (req, res) => {
  try {
    const { eventId, referralCode } = req.body;
    const userId = req.user?._id; // Optional - may not be logged in

    if (!referralCode) {
      return res.status(400).json({ error: 'Referral code is required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Convert to ObjectId for proper comparison
    const eventObjectId = new mongoose.Types.ObjectId(eventId);

    // Find the referrer by searching for a user with this referral code for this event
    const allUsers = await User.find({
      'registeredEvents': {
        $elemMatch: {
          event: eventObjectId,
          referralCode: referralCode,
          paymentStatus: 'paid'
        }
      }
    });

    if (allUsers.length === 0) {
      return res.status(400).json({ 
        error: "Invalid referral code. The person who shared this link may not have paid yet, or the code is for a different event." 
      });
    }

    const referrerId = allUsers[0]._id;

    // Check if user is trying to use their own code (only if logged in)
    if (userId && referrerId.equals(userId)) {
      return res.status(400).json({ error: "You cannot use your own referral code." });
    }

    // Check if this code has reached max usage (1)
    const usageCount = event.referrals.filter(
      ref => ref.referralCode === referralCode
    ).length;

    if (usageCount >= 1) {
      return res.status(400).json({ 
        error: "This referral code has already been used." 
      });
    }

    // Check if user already used a referral for this event (only if logged in)
    if (userId) {
      const alreadyUsedReferral = event.referrals.some(
        ref => ref.referredUserId.equals(userId)
      );

      if (alreadyUsedReferral) {
        return res.status(400).json({ 
          error: "You have already used a referral code for this event." 
        });
      }
    }

    // Referral code is valid
    res.status(200).json({ 
      message: "Referral code is valid",
      referrerEmail: allUsers[0].email,
      usageCount: usageCount,
      remainingUses: 1 - usageCount
    });

  } catch (err) {
    console.error('Error validating referral code:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

