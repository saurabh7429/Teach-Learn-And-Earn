const path = require('path');
const dns  = require('dns');

// Configure reliable DNS servers for MongoDB Atlas SRV resolution
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}

// Load environment variables reliably
require('dotenv').config({ path: path.join(__dirname, '.env') });

const http     = require('http');
const express  = require('express');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors     = require('cors');

const app    = express();
const server = http.createServer(app);

// ── CORS & Socket.IO ──
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin, localhost, or any vercel/render domain
    if (!origin || origin.includes('localhost') || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
};

const io = new Server(server, { cors: corsOptions });
app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join_chat', (chatId) => socket.join(chatId));
  socket.on('leave_chat', (chatId) => socket.leave(chatId));
});

// ── Middleware ──
app.use(cors(corsOptions));
app.use(express.json());

// ── Routes ──
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/skills',   require('./routes/skills'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/chats',    require('./routes/chats'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/ai',       require('./routes/ai'));

// ── Health check & Error Handling ──
app.get('/', (req, res) => res.json({ message: 'TL&E API is running 🚀' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

// ── Connect DB & Start Server ──
const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGO_URI_LOCAL || 'mongodb://127.0.0.1:27017/tledb';

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
  }

  const port = process.env.PORT || 5000;
  server.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));
};

connectDB();
