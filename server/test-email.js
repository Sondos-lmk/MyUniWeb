import { sendEmail } from './src/utils/email.js';

     async function test() {
       try {
         await sendEmail({
           to: 'amlsem7.0@gmail.com',
           subject: 'Test Email from Innovex',
           html: '<p>Test email for OAuth setup.</p>',
         });
         console.log('✅ Test email sent');
       } catch (err) {
         console.error('❌ Test email failed:', err.message, err.stack);
       }
     }
     test();