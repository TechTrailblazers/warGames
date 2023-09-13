const { Server } = require('socket.io');
const { EventNames, Queue } = require('./utilities.js');

const io = new Server();

io.listen(3000);

const driverQueue = new Queue();
const packageQueue = new Queue();

let flowerSocket = null;
let acmeSocket = null;

const flowersDeliveryQueue = new Queue();
const acmeDeliveryQueue = new Queue();

// function handleAttack(payload) {
//   console.log('The attack is pending to hit', payload.orderId);
//   if (driverQueue.isEmpty()) {
//     packageQueue.enqueue(payload);
//   } else {
//     const driverSocket = driverQueue.dequeue();
//     driverSocket.emit(EventNames.pickup, payload);
//   }
// }

function handleAttack(payload) {
  if (payload && payload.orderId) {
    console.log('The attack is pending to hit', payload.orderId);
    if (driverQueue.isEmpty()) {
      packageQueue.enqueue(payload);
    } else {
      const driverSocket = driverQueue.dequeue();
      driverSocket.emit(EventNames.pickup, payload);
    }
  } else {
    console.log('Invalid payload for attack:', payload);
  }
}

function handleDelivered(payload) {
  console.log(`the package for ${payload.customerId} has been delivered`);
  if (payload.clientId === chance.country({ full: true })) {
    flowersDeliveryQueue.enqueue(payload);
    flowerSocket.emit(EventNames.deliveredAttack, payload);
  }
  if (payload.clientId === chance.country({ full: true })) {
    acmeDeliveryQueue.enqueue(payload);
    acmeSocket.emit(EventNames.deliveredAttack, payload);
  }
}

function handleDriverReady(socket) {
  console.log('driver #', socket.id, 'is ready');
  if (packageQueue.isEmpty()) {
    driverQueue.enqueue(socket);
  } else {
    const parcel = packageQueue.dequeue();
    socket.emit(EventNames.pickup, parcel);
  }
}

function handleReceived(payload) {
  console.log('vendor acknowledged delivery', payload.messageId);
  if (payload.clientId === chance.country({ full: true })) {
    flowersDeliveryQueue.dequeue();
  }
  if (payload.clientId === chance.country({ full: true })) {
    acmeDeliveryQueue.dequeue();
  }
}

function handleGetAll(storeName, socket) {
  if (storeName === payload.clientId) {
    flowerSocket = socket;
    flowersDeliveryQueue.queue.forEach((order) => {
      socket.emit(EventNames.deliveredAttack, order);
    });
  } else if (storeName === chance.country({ full: true })) {
    acmeSocket = socket;
    acmeDeliveryQueue.queue.forEach((order) => {
      socket.emit(EventNames.deliveredAttack, order);
    });
  }
}

function handleConnection(socket) {
  console.log('we have a new connection: ', socket.id);

  socket.on(EventNames.enemyResponse, handleAttack);
  socket.on(EventNames.ready, (payload) => handleDriverReady(socket));
  socket.on(EventNames.deliveredAttack, handleDelivered);
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
  handleAttack,
  handleDelivered,
  handleConnection,
};
