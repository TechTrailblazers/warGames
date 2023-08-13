const { chance, EventNames } = require('../../utilities');

function sendPickup(events) {
  const event = {
    store: chance.city(),
    orderId: chance.guid(),
    customer: chance.name(),
    address: chance.address(),
  };
  console.log('vendor request for package pickup', event);
  events.emit(EventNames.pickup, event);
}

function confirmedDelivery(orderId) {
  console.log('Thank you for the delivery!', orderId);
}

function startVendor(events) {
  console.log('vendor has started');
  events.on(EventNames.delivered, confirmedDelivery);

  function ready() {
    sendPickup(events);
    setTimeout(ready, chance.integer({ min: 5000, max: 10000 }));
  }
  ready();
}
module.exports = { startVendor, toTest: { confirmedDelivery } };
