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

console.log('Email config:', {
  CLIENT_ID: CLIENT_ID ? '✅' : '❌',
  CLIENT_SECRET: CLIENT_SECRET ? '✅' : '❌',
  REDIRECT_URI: REDIRECT_URI ? '✅' : '❌',
  REFRESH_TOKEN: REFRESH_TOKEN ? '✅ Loaded' : '❌ Missing',
  EMAIL_USER: EMAIL_USER ? '✅' : '❌',
});

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI || !REFRESH_TOKEN || !EMAIL_USER) {
  throw new Error('Missing required email environment variables');
}

const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const { token } = await oauth2Client.getAccessToken();
    if (!token) {
      throw new Error('Failed to obtain access token');
    }
    console.log('✅ Access token obtained:', token);

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
      from: `"Innovex App" <${EMAIL_USER}>`, // Friendly name for sender
      to,
      subject,
      html,
      text: html.replace(/<[^>]+>/g, ''), // Plain text for Outlook
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
    return result;
  } catch (err) {
    console.error('❌ Email send failed:', err.message, err.response || err);
    throw err;
  }
};