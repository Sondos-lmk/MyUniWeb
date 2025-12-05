/**
 * Referral Helper Utilities
 * Manages referral codes from URL parameters and localStorage
 */

const REFERRAL_STORAGE_KEY = 'innovex_referral';
const REFERRAL_EXPIRY_HOURS = 24;

/**
 * Store referral code and eventId from URL parameters
 * @param {string} referralCode - The referral code from URL
 * @param {string} eventId - The event ID from URL
 */
export function storeReferralCode(referralCode, eventId) {
  if (!referralCode || !eventId) return;

  const referralData = {
    code: referralCode,
    eventId: eventId,
    timestamp: Date.now(),
    expiresAt: Date.now() + (REFERRAL_EXPIRY_HOURS * 60 * 60 * 1000)
  };

  localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(referralData));
  console.log('✅ Referral code stored:', referralCode, 'for event:', eventId);
}

/**
 * Get stored referral code for a specific event
 * @param {string} eventId - The event ID to check
 * @returns {string|null} - The referral code if valid, null otherwise
 */
export function getReferralCode(eventId) {
  try {
    const stored = localStorage.getItem(REFERRAL_STORAGE_KEY);
    console.log('📦 Raw localStorage value:', stored);
    
    if (!stored) return null;

    const referralData = JSON.parse(stored);
    console.log('📋 Parsed referral data:', referralData);
    console.log('🎯 Looking for eventId:', eventId);
    
    // Check if expired
    if (Date.now() > referralData.expiresAt) {
      console.log('⏰ Referral expired');
      clearReferralCode();
      return null;
    }

    // Check if it's for the correct event
    if (referralData.eventId !== eventId) {
      console.log('❌ Event ID mismatch:', referralData.eventId, 'vs', eventId);
      return null;
    }
    
    // Important: Only return if eventId matches exactly
    // The backend will validate if it's your own code

    console.log('✅ Returning referral code:', referralData.code);
    return referralData.code;
  } catch (error) {
    console.error('Error reading referral code:', error);
    return null;
  }
}

/**
 * Get all referral data (for display/debugging)
 * @returns {object|null} - Referral data if valid, null otherwise
 */
export function getReferralData() {
  try {
    const stored = localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (!stored) return null;

    const referralData = JSON.parse(stored);
    
    // Check if expired
    if (Date.now() > referralData.expiresAt) {
      clearReferralCode();
      return null;
    }

    return referralData;
  } catch (error) {
    console.error('Error reading referral data:', error);
    return null;
  }
}

/**
 * Clear stored referral code
 */
export function clearReferralCode() {
  localStorage.removeItem(REFERRAL_STORAGE_KEY);
}

/**
 * Extract referral parameters from URL
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {object|null} - Object with code and eventId, or null
 */
export function extractReferralFromURL(searchParams) {
  const ref = searchParams.get('ref');
  const eventId = searchParams.get('eventId');

  if (ref && eventId) {
    return { code: ref, eventId };
  }

  return null;
}
