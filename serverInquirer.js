import { Server } from 'socket.io';

export const startSocketServer = () => {
  const io = new Server();

  io.on('connection', (socket) => {
    console.log('A user connected.');

    socket.on('chat message', (msg) => {
      console.log('Message received:', msg);
    });
  });

  function handleConnection(socket) {
    console.log('We have a new connection:', socket.id);
  }

  io.on('connection', handleConnection);

  console.log('Socket.io server is running on port 3000');
};
