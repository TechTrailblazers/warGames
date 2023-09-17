const { handleChatMessage } = require('./messageHandler'); // Replace with your actual chat module
const io = require('socket.io-client');
const http = require('http');
const { Server } = require('socket.io');

// Create a mock server for testing
const server = http.createServer();
const socketServer = new Server(server);
const PORT = 3000;

// Start the server
server.listen(PORT);

describe('Chat Message Handling Tests', () => {
  let client1;
  let client2;

  beforeAll((done) => {
    // Connect two clients to the server
    client1 = io(`http://localhost:${PORT}`, { forceNew: true });
    client2 = io(`http://localhost:${PORT}`, { forceNew: true });

    // Wait for both clients to connect
    client1.on('connect', () => {
      client2.on('connect', done);
    });
  });

  afterAll(() => {
    // Disconnect clients and close the server
    client1.disconnect();
    client2.disconnect();
    server.close();
  });

  it('should emit a chat message to all clients', (done) => {
    const message = 'Hello, world!';

    // Mock the behavior of io.emit to check if it's called with the expected arguments
    socketServer.sockets.emit = jest.fn();

    // Simulate a chat message from client 1
    handleChatMessage(socketServer, message, client1);

    // Expect that io.emit was called with the correct arguments
    expect(socketServer.sockets.emit).toHaveBeenCalledWith('chatMessage', {
      sender: client1.id,
      message: message,
    });

    // Simulate a chat message from client 2
    handleChatMessage(socketServer, 'Another message', client2);

    // Expect that io.emit was called again with the correct arguments
    expect(socketServer.sockets.emit).toHaveBeenCalledWith('chatMessage', {
      sender: client2.id,
      message: 'Another message',
    });

    done();
  });
});
