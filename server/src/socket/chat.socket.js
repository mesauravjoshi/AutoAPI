export function registerChatEvents(io, socket) {
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
  });
}