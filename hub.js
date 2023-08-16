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

function handlePickUp(payload) {
  console.log('the pickup was requested for delivery', payload.messageId);
  if (driverQueue.isEmpty()) {
    packageQueue.enqueue(payload);
  } else {
    const driverSocket = driverQueue.dequeue();
    driverSocket.emit(EventNames.pickup, payload);
  }
}

function handleDelivered(payload) {
  console.log(`the package for ${payload.customerId} has been delivered`);
  if (payload.clientId === '1-800-flowers') {
    flowersDeliveryQueue.enqueue(payload);
    flowerSocket.emit(EventNames.delivered, payload);
  }
  if (payload.clientId === 'acme-widgets') {
    acmeDeliveryQueue.enqueue(payload);
    acmeSocket.emit(EventNames.delivered, payload);
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
  if (payload.clientId === '1-800-flowers') {
    flowersDeliveryQueue.dequeue();
  }
  if (payload.clientId === 'acme-widgets') {
    acmeDeliveryQueue.dequeue();
  }
}

function handleGetAll(storeName, socket) {
  if (storeName === '1-800-flowers') {
    flowerSocket = socket;
    flowersDeliveryQueue.queue.forEach((order) => {
      socket.emit(EventNames.delivered, order);
    });
  } else if (storeName === 'acme-widgets') {
    acmeSocket = sockets;
    acmeDeliveryQueue.queue.forEach((order) => {
      socket.emit(EventNames.delivered, order);
    });
  }
}

function handleConnection(socket) {
  console.log('we have a new connection: ', socket.id);

  socket.on(EventNames.pickup, handlePickUp);
  socket.on(EventNames.ready, (payload) => handleDriverReady(socket));
  socket.on(events.delivered, handleDelivered);
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
  handlePickUp,
  handleDelivered,
  handleConnection,
};
