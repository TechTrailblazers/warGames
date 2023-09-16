// const { chance, EventNames } = require('../../utilities');

// function dinates(client) {
//   const event = {
//     country: chance.country({ full: true }),
//     coordinates: ` Attacking on coordinates: ${chance.coordinates({
//       fixed: 2,
//     })}`,
//     countryBeingAttack: chance.country({ full: true }),
//     typeofAttack: chance.pickone(['Air', 'Land', 'Sea']),
//     damage: `${chance.integer({ min: 1000, max: 2500 })}`,
//     health: 10000,
//   };

//   const payload = {
//     event: 'gameStart',
//     messageId: event.orderId,
//     clientId: event.country,
//     countryId: event.countryBeingAttack,
//     order: event,
//     damage: event.damage,
//     health: event.health,
//   };
//   console.log('Waiting on enemy response', event);
//   client.emit(EventNames.gameStart, payload);
// }

// // function acknowledgedAttack(payload, client) {
// //   console.log('Target Hit', payload.messageId);
// //   client.emit('received', payload);
// // }

// function attackStarting(client) {
//   console.log('Commencing attack!');
//   // client.emit('getAll', chance.country({ full: true }));
//   client.on(EventNames.delivered, (payload) =>
//     acknowledgedAttack(payload, client)
//   );

//   function ready() {
//     dinates(client);
//     setTimeout(ready, chance.integer({ min: 5000, max: 10000 }));
//   }
//   ready();
// }

// module.exports = {
//   attackStarting,
//   toTest: { dinates, acknowledgedAttack },
// };
