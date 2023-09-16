const { attackStarting, startPlayer1 } = require('./handler.js');
const { io } = require('socket.io-client');
// User Code
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to the server');

  rl.question('Enter your username: ', (username) => {
    // Emit a welcome message to the server
    socket.emit('chatMessage', `Welcome to the chat, ${username}!`);

    // Listen for chat messages from the server
    socket.on('chatMessage', (message) => {
      // console.log(`${message.sender}: ${message.message}`);
    });

    // Listen for user input and send chat messages to the server
    rl.on('line', (input) => {
      // Stringify the input as a JSON object before sending
      socket.emit('chatMessage', JSON.stringify(input));
    });
  });
});

socket.on('disconnect', () => {
  console.log('Disconnected from the server');
});

// Call your game-related functions here as needed
startPlayer1(socket);
// attackStarting(socket);
