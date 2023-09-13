const { Server } = require('socket.io');
const { EventNames, Queue } = require('./utilities.js');

const io = new Server();

io.listen(3000);

// const userQueue = new Queue();
// const attackQueue = new Queue();
const userQueue = new Queue();
const attackQueue = new Queue();

let country1Socket = null;
let country2Socket = null;

const country1AttackQueue = new Queue();
const country2AttackQueue = new Queue();

let consoleLogShown = false;
let userConsoleLog = false;

function handleGameStart(payload) {
  if (!consoleLogShown) {
    console.log('The user has requested to start the game');
    consoleLogShown = true;
  }

  if (userQueue.isEmpty()) {
    attackQueue.enqueue(payload);
  } else {
    const userSocket = userQueue.dequeue();
    userSocket.emit(EventNames.gameStart, payload);
  }
}

function handleDeliveredAttack(payload, socket) {
  console.log(`the attack for ${payload.clientId} has been confirmed`);
  {
    country1AttackQueue.enqueue(payload);
    socket.emit(EventNames.delivered, payload);
  }
  // if (payload.clientId === '1-800-flowers') {
  // if (payload.clientId === 'acme-widgets') {
  //   country2AttackQueue.enqueue(payload);
  //   country2Socket.emit(EventNames.delivered, payload);
  // }
}

function handleUserReady(socket) {
  if (!userConsoleLog) {
    console.log('User is ready to start');
    userConsoleLog = true;
  }
  if (attackQueue.isEmpty()) {
    userQueue.enqueue(socket);
  } else {
    const attack = attackQueue.dequeue();
    socket.emit(EventNames.gameStart, attack);
  }
}

function handleReceived(payload) {
  console.log('Country knows about the attack', payload.messageId);
  if (payload.clientId === '1-800-flowers') {
    country1AttackQueue.dequeue();
  }
  if (payload.clientId === 'acme-widgets') {
    country2AttackQueue.dequeue();
  }
}

function handleGetAll(storeName, socket) {
  if (storeName === '1-800-flowers') {
    country1Socket = socket;
    country1AttackQueue.queue.forEach((order) => {
      socket.emit(EventNames.delivered, order);
    });
  } else if (storeName === 'acme-widgets') {
    country2Socket = socket;
    country2AttackQueue.queue.forEach((order) => {
      socket.emit(EventNames.delivered, order);
    });
  }
}

function handleConnection(socket) {
  console.log('we have a new connection: ', socket.id);

  socket.on(EventNames.gameStart, handleGameStart);
  socket.on(EventNames.ready, (payload) => handleUserReady(socket));
  socket.on(EventNames.delivered, (payload) =>
    handleDeliveredAttack(payload, socket)
  );
  socket.on('received', handleReceived);
  socket.on('getAll', (storeName) => handleGetAll(storeName, socket));
}

function startServer() {
  io.on('connection', handleConnection);
  console.log('The server has been started');
}

module.exports = {
  startServer,
  io,
  handleGameStart,
  handleDeliveredAttack,
  handleConnection,
};
