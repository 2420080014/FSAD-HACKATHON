const ChatRequest = require('../models/ChatRequest');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const User = require('../models/User');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected via Socket:', socket.id);

    // Users should join a room with their own user ID to receive direct notifications
    socket.on('register_user', async ({ userId, role }) => {
      socket.join(userId);
      socket.userId = userId;
      console.log(`User ${userId} (${role}) joined their personal room`);

      // If listener, auto-join the listeners broadcast room
      if (role === 'Listener') {
        socket.join('listeners');
        console.log(`Listener ${userId} joined the listeners room`);
      }
    });

    // Toggle listener online/offline status
    socket.on('toggle_online', async ({ userId, isOnline }) => {
      try {
        await User.findByIdAndUpdate(userId, { isOnline });
        if (isOnline) {
          socket.join('listeners');
        } else {
          socket.leave('listeners');
        }
        console.log(`User ${userId} is now ${isOnline ? 'Online' : 'Offline'}`);
      } catch (err) {
        console.error('Error toggling online status', err);
      }
    });

    // 1. Send Request Handshake
    socket.on('send_request', async ({ seeker_id, listener_id, post_id }) => {
      try {
        const newRequest = new ChatRequest({ seeker_id, listener_id, post_id });
        await newRequest.save();

        // Populate seeker info for the listener UI
        const populated = await ChatRequest.findById(newRequest._id)
          .populate('seeker_id', 'nickname');

        if (listener_id) {
          // Notify specific listener
          io.to(listener_id).emit('incoming_request', populated);
        } else {
          // General broadcast to all online listeners
          io.to('listeners').emit('incoming_request', populated);
        }
      } catch (err) {
        console.error('Error sending request', err);
      }
    });

    // 2. Accept Request Handshake
    socket.on('accept_request', async ({ request_id, listener_id }) => {
      try {
        const request = await ChatRequest.findById(request_id);
        if (!request || request.status !== 'Pending') return;

        request.status = 'Accepted';
        request.listener_id = listener_id;
        await request.save();

        const chatRoom = new ChatRoom({
          seeker_id: request.seeker_id,
          listener_id: listener_id,
        });
        await chatRoom.save();

        // Notify seeker that request is accepted and room is created
        io.to(request.seeker_id.toString()).emit('request_accepted', {
          room_id: chatRoom._id,
          listener_id
        });

        // Return room info to listener
        socket.emit('request_accepted', {
          room_id: chatRoom._id,
          seeker_id: request.seeker_id
        });
      } catch (err) {
        console.error('Error accepting request', err);
      }
    });

    // 3. Join Chat Room
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // 4. Leave Chat Room
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    // 5. Send Message
    socket.on('send_message', async ({ room_id, sender_id, text_content, file_url }) => {
      try {
        const msg = new Message({ room_id, sender_id, text_content, file_url });
        await msg.save();

        io.to(room_id).emit('receive_message', msg);
      } catch (err) {
        console.error('Error sending message', err);
      }
    });

    // 6. Typing Indicators
    socket.on('typing', ({ room_id, user_name }) => {
      socket.to(room_id).emit('user_typing', user_name);
    });

    socket.on('stop_typing', ({ room_id }) => {
      socket.to(room_id).emit('user_stopped_typing');
    });

    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);
      // Mark user offline if they disconnect
      if (socket.userId) {
        try {
          await User.findByIdAndUpdate(socket.userId, { isOnline: false });
        } catch (err) {
          console.error('Error setting user offline on disconnect', err);
        }
      }
    });
  });
};
