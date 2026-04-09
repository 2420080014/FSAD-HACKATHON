require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const moodRoutes = require('./routes/moods');
const adminRoutes = require('./routes/admin');
const reportRoutes = require('./routes/reports');
const chatRoutes = require('./routes/chats');
const chatSockets = require('./sockets/chatHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // For development
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support base64 images

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/chats', chatRoutes);

// Socket.IO setup
chatSockets(io);

// MongoDB connection handling with fallback to in-memory db
const PORT = process.env.PORT || 5000;
const { MongoMemoryServer } = require('mongodb-memory-server');

async function startServer() {
  let mongoUri = process.env.MONGO_URI;

  try {
    if (!mongoUri) {
      console.log('No MONGO_URI provided. Starting in-memory MongoDB...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB at', mongoUri.substring(0, 30) + '...');
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

startServer();
