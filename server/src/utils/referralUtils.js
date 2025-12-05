import crypto from 'crypto';

/**
 * Generate a unique referral code
 * @param {string} userId - User ID
 * @param {string} eventId - Event ID
 * @returns {string} - Unique referral code
 */
export const generateReferralCode = (userId, eventId) => {
  const timestamp = Date.now();
  const data = `${userId}-${eventId}-${timestamp}`;
  return crypto.createHash('md5').update(data).digest('hex').substring(0, 12);
};

/**
 * Check if referral code is valid and has uses remaining
 * @param {Object} event - Event document
 * @param {string} referralCode - Referral code to validate
 * @returns {Object} - { valid: boolean, referrerUserId: string|null, message: string }
 */
export const validateReferralCode = async (event, referralCode) => {
  if (!referralCode) {
    return { valid: false, referrerUserId: null, message: 'No referral code provided' };
  }

  // Find the referrer's registration with this code
  const referrerRegistration = event.registeredUsers.find(userId => {
    // We need to check if this user has this referral code
    // This will be stored in user.registeredEvents when they paid
    return false; // Will be implemented in the controller
  });

  // Count how many times this code has been used
  const usageCount = event.referrals.filter(
    ref => ref.referralCode === referralCode
  ).length;

  if (usageCount >= 3) {
    return { 
      valid: false, 
      referrerUserId: null, 
      message: 'This referral code has reached its maximum usage limit (3 users)' 
    };
  }

  return { 
    valid: true, 
    referrerUserId: null, // Will be set by controller
    message: 'Valid referral code' 
  };
};
