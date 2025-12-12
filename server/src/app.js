import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from "url";



dotenv.config();
import { stripeWebhook } from './controllers/paymentController.js';
import paymentRoutes from "./routes/paymentRoute.js"
import authRoutes from "./routes/auth.js";


import adminRoutes from './routes/admin.js';
import eventRoutes from './routes/event.js';
import userRoutes from './routes/userRoutes.js';
import gymRoutes from "./routes/gymRoutes.js";
import courtRoutes from "./routes/court.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import loyaltyRoutes from './routes/loyalityRoutes.js';
import pollRoutes from "./routes/pollRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import eventFeedbackRoutes from "./routes/eventFeedbackRoutes.js";
import eventOfficerAnalyticsRoutes from "./routes/eventOfficerAnalyticsRoutes.js";
import clubRoutes from "./routes/clubRoutes.js"

//import courtRoutes from "./routes/court.js";








dotenv.config(); // Load environment variables from .env
console.log('✅ Running Innovex app.js');
const app = express();

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

  app.post(
  '/api/payment/stripe-webhook', 
  express.raw({ type: 'application/json' }), 
  stripeWebhook
);

app.use(morgan('dev'));
app.use(cors({
  origin: 'http://localhost:5000', // Frontend URL
  credentials: true,
}));

// STRIPE WEBHOOK — MUST BE BEFORE express.json()!!!
app.post(
  '/api/payment/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

// ROUTES
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gym', gymRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/payment', paymentRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/documents", documentRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/events", eventFeedbackRoutes);
app.use("/api/eventOfficer/analytics", eventOfficerAnalyticsRoutes);
app.use("/api/clubs", clubRoutes);


// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Not Found' }));



// ✅ Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});
console.log('✅ Routes mounted: /api/events, /api/auth, /api/users, etc.');
export default app;