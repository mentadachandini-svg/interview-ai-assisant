const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB, getDBStatus } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Connect Database
connectDB();

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/interviews', require('./routes/interview'));
app.use('/api/ai', require('./routes/ai'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.status(200).json({
    status: 'online',
    platform: 'Interview AI Assistant',
    tagline: 'Practice. Perform. Improve.',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    aiProvider: process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
      ? 'Gemini 1.5 Flash (Cloud) + Fallback'
      : 'Local High-Fidelity AI Engine (Zero-Cost / Offline Ready)'
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Interview AI Assistant Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

module.exports = { app, server };
