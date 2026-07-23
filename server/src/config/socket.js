import { Server } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();

export function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [process.env.CLIENT_URL],
      methods: ['GET', 'POST'],
      credentials: false,
    },
  });

  io.on('connection', (socket) => {
    // console.log('User Connected:', socket.id);

    socket.on('join-user', (userId) => {
      if (!userId) return;

      socket.join(userId);
      // console.log(`${userId} joined room`);
    });

    socket.on('send-message', (data) => {
      const { senderId, receiverId, text } = data || {};

      if (!senderId || !receiverId || !text) return;

      const message = {
        id: Date.now(),
        senderId,
        receiverId,
        text,
        createdAt: new Date(),
      };

      io.to(receiverId).emit('receive-message', message);
      socket.emit('message-sent', message);

      console.log('Message sent:', message);
    });

    socket.on('disconnect', () => {
      // console.log('User Disconnected:', socket.id);
    });
  });

  return io;
}