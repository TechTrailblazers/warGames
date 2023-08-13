const { Server } = require('socket.io');
const { EventNames, Queue } = require('./utilities.js');

const io = new Server();

io.listen(3000);

const driverQueue = new Queue();
const packageQueue = new Queue();

function handlePickUp(payload) {
  console.log('the pickup was requested for delivery', payload.orderId);
  if (driverQueue.isEmpty()) {
    packageQueue.enqueue(payload);
  } else {
    const driverSocket = driverQueue.dequeue();
    driverSocket.emit(EventNames.pickup, payload);
  }
}

function handleDelivered(payload) {
  console.log(`the package for ${payload.customerId} has been delivered`);
  io.emit(EventNames.delivered, payload);
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

function handleConnection(socket) {
  console.log('we have a new connection: ', socket.id);

  socket.on(EventNames.pickup, handlePickUp);
  socket.on(events.delivered, handleDelivered);
  socket.on(EventNames.ready, (payload) => handleDriverReady(socket));
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
