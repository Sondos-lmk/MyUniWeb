import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

const {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  REFRESH_TOKEN,
  EMAIL_USER,
} = process.env;

// Check if email service is properly configured
const emailConfigured = !!(
  CLIENT_ID &&
  CLIENT_SECRET &&
  REDIRECT_URI &&
  REFRESH_TOKEN &&
  EMAIL_USER
);

if (!emailConfigured) {
  console.warn('⚠️ Email service disabled: Missing Gmail OAuth2 environment variables');
  console.warn('Emails will not be sent. Manually verify users in MongoDB if needed.');
} else {
  console.log('✅ Email service enabled with OAuth2');
}

let oauth2Client;
if (emailConfigured) {
  oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
}

export const sendEmail = async ({ to, subject, html }) => {
  // Graceful handling if email not configured
  if (!oauth2Client) {
    console.warn(`⚠️ Email not sent (service disabled): to=${to}, subject="${subject}"`);
    return { disabled: true, accepted: [], rejected: [] };
  }

  try {
    const { token } = await oauth2Client.getAccessToken();
    if (!token) {
      throw new Error('Failed to obtain access token');
    }
    console.log('✅ Access token obtained');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: EMAIL_USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: token,
      },
    });

    const mailOptions = {
      from: `"Innovex App" <${EMAIL_USER}>`, // Friendly sender name
      to,
      subject,
      html,
      text: html.replace(/<[^>]+>/g, ''), // plain text fallback
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
    return result;
  } catch (err) {
    console.error('❌ Email send failed:', err.message, err.response || err);
    throw err;
  }
};
