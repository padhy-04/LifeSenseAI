import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import meditationRoutes from './routes/meditation.js'; // NEW: Import meditation routes
import yogaRoutes from './routes/yoga.js'; // NEW: Import yoga routes

// Load env vars
dotenv.config();

connectDB();

const app = express();

app.use(cors());

// Body parser
app.use(express.json());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meditation', meditationRoutes); // NEW: Mount meditation routes
app.use('/api/yoga', yogaRoutes); // NEW: Mount yoga routes

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Wellness Platform Backend API is running...');
});

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
);

process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
