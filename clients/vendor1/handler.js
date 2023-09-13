const { chance, EventNames } = require('../../utilities');

function sendPickup(client) {
  const event = {
    store: chance.city(),
    orderId: chance.guid(),
    customer: chance.name(),
    address: chance.address(),
    company: 'acme-widgets',
  };

  const payload = {
    event: 'pickup',
    messageId: event.orderId,
    clientId: `acme-widgets`,
    order: event,
  };
  console.log('Country sent attack', event);
  client.emit(EventNames.gameStart, payload);
}

function acknowledgedDelivery(payload, client) {
  console.log('Countries attack has hit!', payload.messageId);
  client.emit('received', payload);
}

function vendorStart(client) {
  console.log('Country has started their assault');
  client.emit('getAll', 'acme-widgets');
  client.on(EventNames.delivered, (payload) =>
    acknowledgedDelivery(payload, client)
  );

  function ready() {
    sendPickup(client);
    setTimeout(ready, chance.integer({ min: 5000, max: 10000 }));
  }
  ready();
}

module.exports = { vendorStart, toTest: { sendPickup, acknowledgedDelivery } };
