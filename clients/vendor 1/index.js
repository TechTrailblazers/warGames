const { io } = require('socket.io-client');
const events = io('ws://localhost:3000');
const { vendorStart } = require('./handler');

module.exports = { events };
vendorHandler(events);
