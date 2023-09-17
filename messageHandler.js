function handleChatMessage(io, message, socket) {
  try {
    // Parse the received message back into an object

    // Emit the parsed message to all clients
    io.emit('chatMessage', {
      sender: socket.id,
      message: message, // Extract the message property
    });
    console.log(message);
  } catch (error) {
    console.error('Error parsing chat message:', error);
  }
}

module.exports = {
  handleChatMessage,
};
