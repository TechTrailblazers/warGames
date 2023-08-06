const eventPool = require('../eventPool');

eventPool.on('pickup', (payload) => {
  console.log(`DRIVER: picked up ${payload.orderId}`);

  eventPool.emit('in-transit', payload);

  setTimeout(() => {
    console.log(`DRIVER: delivered ${payload.orderId}`);

    eventPool.emit('delivered', payload);
  }, 3000);
});

module.exports = {};
