// 'use strict';

// const eventPool = require('../eventPool');
// const Chance = require('chance');
// const chance = new Chance();

// function pickupEvent(storeName) {
//   // const orderId = chance.guid();
//   // const customerName = chance.name();
//   // const address = chance.address({ short_suffix: true });

//   const payload = {
//     store: storeName,
//     orderId: chance.guid(),
//     customer: chance.name(),
//     address: chance.address({ short_suffix: true }),
//   };
//   // console.log(`Vendor Module: Pickup event for ${storeName}`);
//   eventPool.emit('pickup', payload);
//   // console.log(payload);
// }

// eventPool.on('delivered', (payload) => {
//   console.log(`Thank you for your order ${payload.customer}`);
// });

// module.exports = { pickupEvent };
