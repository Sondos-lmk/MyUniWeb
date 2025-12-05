import { Event } from '../models/Events/Event.js';
import { User } from '../models/Users/User.js';
import { sendEmail } from './email.js';

/**
 * Process referral rewards for events that have passed the 2-week cancellation deadline
 * Both referrer and referred user get 20% of event price back to their wallet
 */
export const processReferralRewards = async () => {
  try {
    console.log('🎁 Starting referral reward processing...');

    const now = new Date();
    
    // Find all events where:
    // 1. Start date is in the future (event hasn't happened yet)
    // 2. We're past the 2-week cancellation deadline (startDate - 14 days)
    // 3. Has referrals that haven't been rewarded
    const events = await Event.find({
      startDate: { $gt: now },
      'referrals.rewardGranted': false
    });

    let totalRewardsGranted = 0;

    for (const event of events) {
      const eventStartDate = new Date(event.startDate);
      const twoWeeksBeforeEvent = new Date(eventStartDate);
      twoWeeksBeforeEvent.setDate(twoWeeksBeforeEvent.getDate() - 14);

      // Check if we're past the 2-week mark
      if (now < twoWeeksBeforeEvent) {
        continue; // Too early for this event
      }

      console.log(`📅 Processing rewards for event: ${event.title} (ID: ${event._id})`);

      // Process each referral for this event
      for (const referral of event.referrals) {
        if (referral.rewardGranted) {
          continue; // Already processed
        }

        try {
          // Fetch both users
          const referrer = await User.findById(referral.referrerUserId);
          const referred = await User.findById(referral.referredUserId);

          if (!referrer || !referred) {
            console.warn(`⚠️ User not found for referral: ${referral._id}`);
            continue;
          }

          // Find their registrations for this event
          const referrerReg = referrer.registeredEvents.find(
            reg => reg.event.equals(event._id)
          );
          const referredReg = referred.registeredEvents.find(
            reg => reg.event.equals(event._id)
          );

          if (!referrerReg || !referredReg) {
            console.warn(`⚠️ Registration not found for referral: ${referral._id}`);
            continue;
          }

          // Check if both are still paid (not refunded/cancelled)
          if (referrerReg.paymentStatus !== 'paid' || referredReg.paymentStatus !== 'paid') {
            console.log(`❌ Reward cancelled: One or both users cancelled/refunded for event ${event._id}`);
            referral.rewardGranted = true; // Mark as processed (but no reward given)
            continue;
          }

          // Calculate 15% reward
          const referrerReward = referrerReg.priceAtRegistration * 0.15;
          const referredReward = referredReg.priceAtRegistration * 0.15;

          // Add to wallets
          if (typeof referrer.wallet !== 'number') referrer.wallet = 0;
          if (typeof referred.wallet !== 'number') referred.wallet = 0;

          referrer.wallet += referrerReward;
          referred.wallet += referredReward;

          // Add transaction records
          referrer.walletTransactions = referrer.walletTransactions || [];
          referrer.walletTransactions.push({
            amount: referrerReward,
            type: 'refund',
            description: `Referral reward for ${event.title}`,
            date: new Date()
          });

          referred.walletTransactions = referred.walletTransactions || [];
          referred.walletTransactions.push({
            amount: referredReward,
            type: 'refund',
            description: `Referral reward for ${event.title}`,
            date: new Date()
          });

          await referrer.save();
          await referred.save();

          // Mark referral as rewarded
          referral.rewardGranted = true;

          // Send notification emails
          await sendEmail({
            to: referrer.email,
            subject: '🎁 Referral Reward Credited!',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                <h2 style="color: #004a99;">🎉 You've Earned a Referral Reward!</h2>
                <p>Hi ${referrer.name},</p>
                <p>Great news! Your friend ${referred.name} used your referral and both of you have stayed registered for <strong>${event.title}</strong>.</p>
                <p>As a reward, we've added <strong>EGP ${referrerReward.toFixed(2)}</strong> to your wallet!</p>
                <p style="margin-top: 20px;">Current wallet balance: <strong>EGP ${referrer.wallet.toFixed(2)}</strong></p>
                <p style="color: #666; font-size: 0.9em;">Thank you for spreading the word about our events!</p>
                <p style="margin-top: 20px;"><em>The Innovex Team</em></p>
              </div>
            `
          });

          await sendEmail({
            to: referred.email,
            subject: '🎁 Referral Reward Credited!',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                <h2 style="color: #004a99;">🎉 You've Earned a Referral Reward!</h2>
                <p>Hi ${referred.name},</p>
                <p>Great news! You used ${referrer.name}'s referral and both of you have stayed registered for <strong>${event.title}</strong>.</p>
                <p>As a reward, we've added <strong>EGP ${referredReward.toFixed(2)}</strong> to your wallet!</p>
                <p style="margin-top: 20px;">Current wallet balance: <strong>EGP ${referred.wallet.toFixed(2)}</strong></p>
                <p style="color: #666; font-size: 0.9em;">Thank you for joining us!</p>
                <p style="margin-top: 20px;"><em>The Innovex Team</em></p>
              </div>
            `
          });

          totalRewardsGranted++;
          console.log(`✅ Reward granted: ${referrer.name} (+${referrerReward}) & ${referred.name} (+${referredReward}) for ${event.title}`);

        } catch (refError) {
          console.error(`❌ Error processing referral ${referral._id}:`, refError);
        }
      }

      // Save event with updated referral statuses
      await event.save();
    }

    console.log(`✅ Referral reward processing complete. ${totalRewardsGranted} rewards granted.`);

  } catch (err) {
    console.error('❌ Error in referral reward scheduler:', err);
  }
};
