import express from 'express';
import morgan from 'morgan';
import perkRoutes from './routes/perks.js';
import authRoutes from './routes/auth.js';

import adminRoutes from './routes/admin.js';

import eventRoutes from './routes/event.js';



import cors from 'cors';

import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js'; 

const app = express();

app.use(morgan('dev'));
// ✅ Allow frontend (port 5000) to access backend (port 4000)
app.use(cors({ origin: 'http://localhost:5000' }));
app.use(express.json());


app.use(cors({
  origin: 'http://localhost:5000',
  credentials: true,
}));


app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/perks', perkRoutes);

app.use('/api/users', userRoutes);   // 👈 added for admin/user endpoints
app.use('/api/events', eventRoutes); // 👈 added for events logic

app.use('/api/auth', authRoutes);

app.use('/api/admin', adminRoutes);


app.use('/api/event', eventRoutes);



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
