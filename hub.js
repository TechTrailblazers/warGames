const { Server } = require('socket.io');
const { chance, EventNames, Queue } = require('./utilities.js');

const io = new Server();

io.listen(3000);

const userQueue = new Queue();
const attackQueue = new Queue();

const country1AttackQueue = new Queue();

let consoleLogShown = false;
let userConsoleLog = false;

function handleGameStart(payload, client) {
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
  if (attackQueue.isEmpty()) {
    userQueue.enqueue(socket);
  } else {
    const attack = attackQueue.dequeue();
    socket.emit(EventNames.gameStart, attack);
  }
}

function handleKnown(payload, socket) {
  console.log(payload.countryId, 'knows about the attack');
  {
    country1AttackQueue.dequeue(payload);
  }
}

function handleConnection(socket) {
  console.log('we have a new connection: ', socket.id);

  socket.on(EventNames.gameStart, handleGameStart);
  socket.on(EventNames.ready, (payload) => handleUserReady(socket));
  socket.on(EventNames.delivered, (payload) =>
    handleConfirmedAttack(payload, socket)
  );
  socket.on(EventNames.received, (payload) => handleKnown(payload, socket));
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
