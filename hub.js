const { Server } = require('socket.io');
const events = require('./utilities.js');

const io = new Server();

io.listen(3000);

const caps = io.of('/caps');

function handlePickUp(payload, socket) {
  console.log('the pickup was requested', payload.orderId);
  socket.emit('received', { message: 'pickup acknowledged' });
  caps.emit(events.ready, { message: 'a pickup is now ready', ...payload });
}

function handleDelivered(payload) {
  console.log(`the package for ${payload.customerId} has been delivered`);
  caps.emit(events.delivered, {
    orderId: payload.orderId,
    message: `the package for ${payload.customerId} has been delivered`,
  });
}

function handlePickedUp(payload) {
  console.log('the driver picked up the package', payload.orderId);
  caps.emit(events.pickUp, payload);
}

function handleInTransit(payload) {
  console.log('the package is in transit', payload.orderId);
  caps.emit(events.inTransit, payload);
}

function handleConnection(socket) {
  console.log('we have a new connection: ', socket.id);

  socket.on(events.pickup, (payload) => handlePickUp(payload, socket));
  socket.on(events.pickedUp, handlePickedUp);
  socket.on(events.inTransit, handleInTransit);
  socket.on(events.delivered, handleDelivered);
}

function startServer() {
  console.log('The server has been started');
  caps.on('connection', handleConnection);
}

module.exports = {
  startServer,
  handleInTransit,
  handleDelivered,
  io,
  caps,
};
