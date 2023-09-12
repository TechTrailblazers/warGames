const { chance, EventNames } = require('../../utilities');

function sendPickup(client) {
  const event = {
    country: chance.country({ full: true }),
    coordinates: ` Attacking on coordinates: ${chance.coordinates({
      fixed: 2,
    })}`,
    countryBeingAttack: chance.country({ full: true }),
    typeofAttack: chance.pickone(['Air', 'Land', 'Sea']),
    damage: `${chance.integer({ min: 10, max: 25 })}%`,
    // company: 'acme-widgets',
  };

  const payload = {
    event: 'enemyResponse',
    messageId: event.orderId,
    clientId: chance.country({ full: true }),
    order: event,
  };
  console.log('Waiting on enemy response', event);
  client.emit(EventNames.enemyResponse, payload);
}

function acknowledgedDelivery(payload, client) {
  console.log('Target Hit', payload.messageId);
  client.emit('received', payload);
}

function vendorStart(client) {
  console.log('Commencing attack!');
  client.emit('getAll', chance.country({ full: true }));
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
