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

// Initialize OAuth2 client only if all variables are present
let oauth2Client = null;
let emailConfigured = false;

const initializeEmailService = () => {
  emailConfigured = !!(
    CLIENT_ID &&
    CLIENT_SECRET &&
    REDIRECT_URI &&
    REFRESH_TOKEN &&
    EMAIL_USER
  );

  if (emailConfigured) {
    oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    console.log('✅ Email service configured successfully');
  } else {
    console.warn('⚠️ Email service disabled: Missing Gmail OAuth2 environment variables');
    console.warn('Emails will not be sent. Manually verify users in MongoDB if needed.');
  }
};

// Initialize the service
initializeEmailService();

export const sendEmail = async ({ to, subject, html }) => {
  // Check if email is configured
  if (!emailConfigured) {
    console.warn(`⚠️ Email not sent (service disabled): to=${to}, subject="${subject}"`);
    return { disabled: true, accepted: [], rejected: [] };
  }

  try {
    console.log('🔄 Getting access token...');
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
      from: `"Innovex App" <${EMAIL_USER}>`,
      to,
      subject,
      html,
      text: html ? html.replace(/<[^>]+>/g, '') : subject || 'No content available',
    };

    console.log(`📧 Attempting to send email to ${to}...`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}`);
    return result;
  } catch (err) {
    console.error('❌ Email send failed:', err.message);
    if (err.response) {
      console.error('Error details:', err.response);
    }
    throw err;
  }
};

// Export the configuration status
export const isEmailConfigured = () => emailConfigured;