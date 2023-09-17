const { Server } = require('socket.io');
const { chance, EventNames, Queue } = require('./utilities.js');
const { v4: uuidv4 } = require('uuid');

const io = new Server();

io.listen(3000);

const connectedUsers = new Map();

let consoleLogShown = false;
let userConsoleLog = false;
let connectedUsersCount = 0;

function handleChatMessage(message, socket) {
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

function handleGameStart(payload, client) {
  if (!consoleLogShown) {
    console.log('The user has requested to start the game');
    consoleLogShown = true;
  }

  if (connectedUsersCount === 2) {
    startGame();
  }
}

function handleConfirmedAttack(payload, socket) {
  console.log(`the attack for ${payload.countryId} has been confirmed`);
  {
    country1AttackQueue.enqueue(payload);
    socket.emit(EventNames.delivered, payload);
  }
}

function handleUserReady(socket) {
  if (!userConsoleLog) {
    console.log('User is ready to start');
    userConsoleLog = true;
  }
  connectedUsersCount++;

  if (connectedUsersCount === 2) {
    startGame();
  }
}

function handleKnown(payload, socket) {
  console.log(payload.countryId, 'knows about the attack');
}

function handleConnection(socket) {
  console.log('we have a new connection: ', socket.id);
  connectedUsers.set(socket.id, socket);

  socket.on('chosenNumPlayers', (numPlayers) => {
    if (numPlayers === 1 || numPlayers === 2) {
      // Handle the chosen number of players here as needed
      const player = {
        socket,
        numPlayers,
        // Other player-specific data
      };

      // Emit a custom event to inform the client about the chosen number of players
      socket.emit('numPlayersChosen', numPlayers);

      // Continue with your event handling logic
      socket.on('chatMessage', (message) => {
        handleChatMessage(message, socket);
      });

      socket.on(EventNames.gameStart, handleGameStart);

      socket.on(EventNames.ready, () => {
        handleUserReady(socket);
      });

      socket.on(EventNames.received, (payload) => handleKnown(payload, socket));

      socket.on('disconnect', () => {
        console.log('User disconnected: ', socket.id);
        connectedUsersCount--;
        connectedUsers.delete(socket.id);
      });
    } else {
      // Invalid input, you can handle this case accordingly
      socket.emit('invalidInput', 'Please choose 1 or 2 players.');
      socket.disconnect(); // Disconnect the user
    }
  });
}

function startGame() {
  console.log('Both users are connected and ready. Starting the game...');
  const userSockets = Array.from(connectedUsers.values());
  const player1Id = uuidv4(); // Generate a unique ID for Player 1
  const player2Id = uuidv4();

  // Customize the payload for each player
  const payloadPlayer1 = {
    playerId: player1Id,
    playerName: 'Player 1',
    // Other player-specific data
  };

  const payloadPlayer2 = {
    playerId: player2Id,
    playerName: 'Player 2',
    // Other player-specific data
  };

  userSockets.forEach((socket, index) => {
    const payload = index === 0 ? payloadPlayer1 : payloadPlayer2;
    socket.emit(EventNames.gameStart, payload);
  });
}
function startServer() {
  io.on('connection', handleConnection);
  console.log('The server has been started');
}

module.exports = {
  startServer,
  io,
  handleGameStart,
  handleConfirmedAttack,
  handleConnection,
};
