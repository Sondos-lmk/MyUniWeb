import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';



dotenv.config();


import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import eventRoutes from './routes/event.js';
import userRoutes from './routes/userRoutes.js';
import gymRoutes from "./routes/gymRoutes.js";
import courtRoutes from "./routes/court.js";




dotenv.config(); // Load environment variables from .env
console.log('✅ Running Innovex app.js');
const app = express();

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use(morgan('dev'));
app.use(cors({
  origin: 'http://localhost:5000', // Frontend URL
  credentials: true,
}));
app.use(express.json());

// ✅ Routes
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/gym", gymRoutes);
app.use("/api/courts", courtRoutes);

// ✅ Not found
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});
console.log('✅ Routes mounted: /api/events, /api/auth, /api/users, etc.');
export default app;
