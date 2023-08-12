'use strict';
const { io } = require('socket.io-client');
const events = require('../../utilities.js');

const client = io('ws://localhost:3000/caps');

const payload = {
  customerId: 'Jane Doe',
  orderId: 1,
  address: '1234 spice dr',
};
client.emit(events.pickup, payload);

client.on(events.announcement, (payload) => console.log(payload.message));
console.log(client.emit);
client.on(events.pickedUp, (payload) =>
  console.log('The package has been picked up by the driver', payload.orderId)
);
client.on(events.pickedUp, (payload) =>
  console.log('the package, is in transit', payload.orderId)
);

client.on(events.delivered, (payload) =>
  console.log(payload.message, payload.orderId)
);

module.exports = { client };
