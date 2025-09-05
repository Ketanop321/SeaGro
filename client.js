const socket = io('http://localhost:5000');

// Join a room
socket.emit('joinRoom', { userId: 'user1', roomId: 'room123' });

// Send a message
function sendMessage(message) {
    socket.emit('sendMessage', { roomId: 'room123', message });
}

// Listen for incoming messages
socket.on('receiveMessage', (message) => {
    console.log('New message:', message);
});