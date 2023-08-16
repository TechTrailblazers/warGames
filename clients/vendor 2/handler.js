const { chance, EventNames } = require('../../utilities');

function sendPickup(events) {
  const event = {
    store: chance.city(),
    orderId: chance.guid(),
    customer: chance.name(),
    address: chance.address(),
    company: 'Flowers',
  };

  const payload = {
    event: 'pickup',
    messageId: event.orderId,
    clientId: `1-800-flowers`,
    order: event,
  };
  console.log('Vendor asking for pickup!', event);
  events.emit(EventNames.pickup, payload);
}

function acknowledgedDelivery(payload, client) {
  console.log('THank you for the delivery', payload.messageId);
  client.emit('received', payload);
}

function vendorStart(client) {
  console.log('Vendor is started');
  client.emit('getAll', '1-800-flowers');
  client.on(EventNames.delivered, (payload) =>
    acknowledgedDelivery(payload, client)
  );

  function ready() {
    sendPickup(client);
    setTimeout(ready, chance.integer({ min: 5000, max: 10000 }));
  }
  ready();
}
module.exports = {
  vendorStart,
  toTest: { sendPickup, acknowledgedDelivery },
};
