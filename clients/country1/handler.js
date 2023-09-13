const { chance, EventNames } = require('../../utilities');

function sendCoordinates(client) {
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
    messageId: event.country,
    clientId: chance.country({ full: true }),
    order: event,
  };
  console.log('Waiting on enemy response', event);
  client.emit(EventNames.enemyResponse, payload);
}

function acknowledgedAttack(payload, client) {
  console.log('Target Hit', payload.messageId);
  client.emit('received', payload);
}

function attackStarting(client) {
  console.log('Commencing attack!');
  client.emit('getAll', chance.country({ full: true }));
  client.on(EventNames.deliveredAttack, (payload) =>
    acknowledgedAttack(payload, client)
  );

  function ready() {
    sendCoordinates(client);
    setTimeout(ready, chance.integer({ min: 5000, max: 10000 }));
  }
  ready();
}

module.exports = {
  attackStarting,
  toTest: { sendCoordinates, acknowledgedAttack },
};
