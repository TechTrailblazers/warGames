const { chance, EventNames } = require('../../utilities');

function deliver(payload, client) {
  console.log('Country has been impacted', payload.messageId);
  client.emit(EventNames.delivered, payload);
  client.emit(EventNames.ready);
}

function handlePickup(payload, client) {
  console.log('Country Attack has incoming attack', payload.messageId);
  setTimeout(
    () => deliver(payload, client),
    chance.integer({ min: 5000, max: 10000 })
  );
}

function startDriver(client) {
  console.log("Let's go!");
  client.emit(EventNames.ready);
  client.on(EventNames.pickup, (payload) => handlePickup(payload, client));
}

module.exports = { startDriver, toTest: { deliver, handlePickup } };
