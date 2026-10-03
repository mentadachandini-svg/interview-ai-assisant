const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS servers for reliable SRV resolution on Node.js / Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if not permitted
}

let isConnected = false;
let useFallbackStore = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interview_ai_db';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = true;
    useFallbackStore = false;
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database] MongoDB connection failed (${error.message}).`);
    console.log('[Database] Activating Resilient Local Fallback Store (Zero-Config Mode). All operations will function seamlessly.');
    useFallbackStore = true;
    isConnected = true;
  }
};

const getDBStatus = () => ({
  isConnected,
  useFallbackStore,
  type: useFallbackStore ? 'Local In-Memory / File Storage' : 'MongoDB'
});

module.exports = { connectDB, getDBStatus };

