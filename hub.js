const { Server } = require('socket.io');
const { chance, EventNames, Queue } = require('./utilities.js');

const io = new Server();

io.listen(3000);

const userQueue = new Queue();
const attackQueue = new Queue();

const country1AttackQueue = new Queue();

let consoleLogShown = false;
let userConsoleLog = false;

function sendCoordinates(client) {
  const event = {
    country: chance.country({ full: true }),
    coordinates: ` Attacking on coordinates: ${chance.coordinates({
      fixed: 2,
    })}`,
    countryBeingAttack: chance.country({ full: true }),
    typeofAttack: chance.pickone(['Air', 'Land', 'Sea']),
    damage: `${chance.integer({ min: 1000, max: 2500 })}`,
    health: 10000,
  };

  const payload = {
    event: 'gameStart',
    messageId: event.orderId,
    clientId: event.country,
    countryId: event.countryBeingAttack,
    order: event,
    damage: event.damage,
    health: event.health,
  };
  console.log('Waiting on enemy response', event);
  client.emit(EventNames.gameStart, payload);
}

function acknowledgedAttack(payload, client) {
  console.log('Target Hit', payload.countryId);
  client.emit('received', payload);
}
function failedAttack(payload, client) {
  console.log('Target Missed', payload.countryId);
  client.emit('received', payload);
}

function attackStarting(client) {
  console.log('Commencing attack!');
  client.on(EventNames.delivered, (payload) =>
    acknowledgedAttack(payload, client)
  );
  client.on(EventNames.attackFailed, (payload) =>
    failedAttack(payload, client)
  );

  function ready() {
    sendCoordinates(client);
    setTimeout(ready, chance.integer({ min: 5000, max: 10000 }));
  }
  ready();
}

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

function handleDeliveredAttack(payload, socket) {
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

function handleReceived(payload, socket) {
  console.log('Country knows about the attack');
  {
    country1AttackQueue.dequeue(payload);
  }
}

function handleConnection(socket) {
  console.log('we have a new connection: ', socket.id);

  socket.on(EventNames.gameStart, handleGameStart);
  socket.on(EventNames.ready, (payload) => handleUserReady(socket));
  socket.on(EventNames.delivered, (payload) =>
    handleDeliveredAttack(payload, socket)
  );
  socket.on(EventNames.received, (payload) => handleReceived(socket));

  attackStarting(socket);
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
