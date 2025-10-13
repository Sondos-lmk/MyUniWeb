import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import perkRoutes from './routes/perks.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import eventRoutes from './routes/event.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

app.use(morgan('dev'));
app.use(cors({
  origin: 'http://localhost:5000', // Frontend URL
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/perks', perkRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Not found
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

export default app;