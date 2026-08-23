// Load environment variables
require('dotenv').config();

const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ── Middleware ──
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ── Routes ──
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/skills',   require('./routes/skills'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/chats',    require('./routes/chats'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/ai',       require('./routes/ai'));

// ── Health check ──
app.get('/', (req, res) => res.json({ message: 'TL&E API is running 🚀' }));

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

// ── Connect to MongoDB (Triple Fail-safe: Atlas -> Local -> Memory Server) ──
const connectDB = async () => {
  const primaryURI = process.env.MONGO_URI;
  const fallbackURI = process.env.MONGO_URI_LOCAL || 'mongodb://127.0.0.1:27017/tledb';

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(primaryURI, { serverSelectionTimeoutMS: 4000, family: 4 });
    console.log('✅ MongoDB Atlas connected successfully');
  } catch (err) {
    console.warn('⚠️ MongoDB Atlas connection error:', err.message);
    try {
      console.log('🔄 Trying local MongoDB:', fallbackURI);
      await mongoose.connect(fallbackURI, { serverSelectionTimeoutMS: 3000 });
      console.log('✅ Local MongoDB connected successfully');
    } catch (localErr) {
      console.warn('⚠️ Local MongoDB unavailable. Launching In-Memory Database...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const memUri = mongoServer.getUri();
        await mongoose.connect(memUri);
        console.log('✅ In-Memory MongoDB connected successfully');
      } catch (memErr) {
        console.error('❌ Could not start database:', memErr.message);
        process.exit(1);
      }
    }
  }

  app.listen(process.env.PORT || 5000, () =>
    console.log(`🚀 Server running on http://localhost:${process.env.PORT || 5000}`)
  );
};

connectDB();
