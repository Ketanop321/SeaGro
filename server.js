const io = require('socket.io')(server);

io.on('connection', (socket) => {
    // Join a room based on a unique room ID
    socket.on('joinRoom', ({ userId, roomId }) => {
        socket.join(roomId);
        console.log(`${userId} joined room: ${roomId}`);
    });

    // Handle sending messages
    socket.on('sendMessage', ({ roomId, message }) => {
        // Broadcast the message to everyone in the room except the sender
        socket.to(roomId).emit('receiveMessage', message);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});
