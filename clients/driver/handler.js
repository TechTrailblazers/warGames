const { chance, EventNames } = require('../../utilities');

function deliver(payload, client) {
  console.log('Driver finished delivery', payload.messageId);
  client.emit(EventNames.delivered, payload);
  client.emit(EventNames.ready);
}

function handlePickup(payload, client) {
  console.log('Driver received a pickup request!', payload.messageId);
  setTimeout(
    () => deliver(payload, client),
    chance.integer({ min: 5000, max: 10000 })
  );
}

function startDriver(client) {
  console.log('Driver is started');
  client.emit(EventNames.ready);
  client.on(EventNames.gameStart, (payload) => handlePickup(payload, client));
}

module.exports = { startDriver, toTest: { deliver, handlePickup } };
