const http     = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const dns  = require('dns');

const { createApp } = require('./app');

// Configure reliable DNS servers for MongoDB Atlas SRV resolution
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}

const { app, corsOptions } = createApp();
const server = http.createServer(app);

const io = new Server(server, { cors: corsOptions });
app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join_chat', (chatId) => socket.join(chatId));
  socket.on('leave_chat', (chatId) => socket.leave(chatId));
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

if (require.main === module) {
  connectDB();
}

module.exports = { connectDB };
