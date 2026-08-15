// env loaded via node --env-file=.env
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

// ── Health check ──
app.get('/', (req, res) => res.json({ message: 'TL&E API is running 🚀' }));

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

// ── Connect to MongoDB ──
const connectDB = async () => {
  const primaryURI = process.env.MONGO_URI;
  const fallbackURI = process.env.MONGO_URI_LOCAL || 'mongodb://localhost:27017/tledb';

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(primaryURI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB Atlas connected successfully');
  } catch (err) {
    console.warn('⚠️ MongoDB Atlas connection error:', err.message);
    console.log('🔄 Falling back to local MongoDB:', fallbackURI);
    try {
      await mongoose.connect(fallbackURI);
      console.log('✅ Local MongoDB connected successfully');
    } catch (localErr) {
      console.error('❌ Local MongoDB connection error:', localErr.message);
      process.exit(1);
    }
  }

  app.listen(process.env.PORT || 5000, () =>
    console.log(`🚀 Server running on http://localhost:${process.env.PORT || 5000}`)
  );
};

connectDB();
