import cron from 'node-cron';
import { Booth } from './models/Events/Booth.js';
import { Bazaar } from './models/Events/Bazaar.js';

/**
 * Cron job to check for expired booth applications and reject them
 * Runs every hour
 */
export const startBoothExpirationCron = () => {
  // Run every hour (at minute 0)
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🔍 Checking for expired booth applications...');
      
      const rejectedCount = await Booth.rejectExpiredApplications();
      
      if (rejectedCount > 0) {
        console.log(`✅ Rejected ${rejectedCount} expired booth application(s)`);
      } else {
        console.log('✅ No expired applications found');
      }
    } catch (error) {
      console.error('❌ Error in booth expiration cron job:', error);
    }
  });

  console.log('⏰ Booth expiration cron job started (runs every hour)');
};


/**
 * Cron job to check for expired bazaar booth applications and reject them
 * Runs every hour
 */
export const startBazaarExpirationCron = () => {
  // Run every hour (at minute 0)
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🔍 Checking for expired bazaar applications...');
      
      const rejectedCount = await Bazaar.rejectExpiredApplications();
      
      if (rejectedCount > 0) {
        console.log(`✅ Rejected ${rejectedCount} expired bazaar application(s)`);
      } else {
        console.log('✅ No expired bazaar applications found');
      }
    } catch (error) {
      console.error('❌ Error in bazaar expiration cron job:', error);
    }
  });

  console.log('⏰ Bazaar expiration cron job started (runs every hour)');
};
