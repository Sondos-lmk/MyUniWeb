
import dotenv from 'dotenv';
// Load .env before any other imports so modules that read process.env during import
// (for example utils/email.js) will see the variables.
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import cron from 'node-cron';
import { sendCertificatesForCompletedWorkshops } from './utils/certificateScheduler.js';

console.log('Environment variables:', {
  CLIENT_ID: process.env.CLIENT_ID ? '✅' : '❌',
  CLIENT_SECRET: process.env.CLIENT_SECRET ? '✅' : '❌',
  REDIRECT_URI: process.env.REDIRECT_URI ? '✅' : '❌',
  REFRESH_TOKEN: process.env.REFRESH_TOKEN ? '✅' : '❌',
  EMAIL_USER: process.env.EMAIL_USER ? '✅' : '❌',
  MONGO_URI: process.env.MONGO_URI ? '✅' : '❌'
});


// Run every hour
cron.schedule('0 * * * *', async () => {
  console.log('Checking for overdue payments...');
  await rejectOverduePayments();
});



const PORT = process.env.PORT || 4000;

async function bootstrap() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });

  // 📅 Schedule certificate sending for completed workshops
  // Runs every minute for testing (change to '0 0 * * *' for daily at midnight in production)
  cron.schedule('* * * * *', async () => {
    await sendCertificatesForCompletedWorkshops();
  });

  console.log('✅ Certificate scheduler initialized (runs every minute for testing)');
}
bootstrap();
