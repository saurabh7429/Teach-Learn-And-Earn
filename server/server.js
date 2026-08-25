// Load environment variables
require('dotenv').config();

const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}

const http    = require('http');
const express = require('express');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors    = require('cors');

const app    = express();
const server = http.createServer(app);

// ── Socket.IO setup ──
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  },
});

// Make io accessible in routes
app.set('io', io);

io.on('connection', (socket) => {
  // Join a specific chat room
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
  });

  socket.on('leave_chat', (chatId) => {
    socket.leave(chatId);
  });

  socket.on('disconnect', () => {});
});

// ── Middleware ──
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
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

// ── Connect to MongoDB & Start Server ──
const connectDB = async () => {
  const primaryURI  = process.env.MONGO_URI;
  const fallbackURI = process.env.MONGO_URI_LOCAL || 'mongodb://127.0.0.1:27017/tledb';

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(primaryURI, { serverSelectionTimeoutMS: 4000, family: 4 });
    console.log('✅ MongoDB Atlas connected successfully');
  } catch (err) {
    console.warn('⚠️ MongoDB Atlas error:', err.message);
    try {
      await mongoose.connect(fallbackURI, { serverSelectionTimeoutMS: 3000 });
      console.log('✅ Local MongoDB connected');
    } catch (localErr) {
      console.warn('⚠️ Local MongoDB unavailable — launching in-memory DB...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
      console.log('✅ In-Memory MongoDB connected');
    }
  }

  server.listen(process.env.PORT || 5000, () =>
    console.log(`🚀 Server running on http://localhost:${process.env.PORT || 5000}`)
  );
};

connectDB();
