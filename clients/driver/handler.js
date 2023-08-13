const { chance, EventNames } = require('../../utilities');

function deliver(orderId, io) {
  console.log('Driver finished delivery', orderId);
  io.emit(EventNames.delivered, orderId);
  io.emit(EventNames.ready);
}

function handlePickUp(payload, io) {
  console.log('Driver received a pickup request!', payload.orderId);
  setTimeout(
    () => deliver(payload.orderId, io),
    chance.integer({ min: 5000, max: 10000 })
  );
}

function startDriver(io) {
  console.log('Driver is started');
  io.emit(EventNames.ready);
  io.on(EventNames.pickup, (payload) => handlePickUp(payload, io));
}

module.exports = { startDriver, toTest: { deliver, handlePickUp } };
