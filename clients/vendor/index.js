'use strict';
const { io } = require('socket.io-client');
const vendorHandler = require('./handler');

const client = io('ws://localhost:3000/caps');

const payload = {
  customerId: 'Jane Doe',
  orderId: 1,
  address: '1234 spice dr',
};
client.emit(events.pickup, payload);

client.on(events.announcement, (payload) => console.log(payload.message));
client.on(events.pickUp, (payload) =>
  console.log('The package has been picked up by the driver', payload.orderId)
);
client.on(events.pickUp, (payload) =>
  console.log('the package, is in transit', payload.orderId)
);

client.on(events.delivered, (payload) =>
  console.log(payload.message, payload.orderId)
);

module.exports = { client };
