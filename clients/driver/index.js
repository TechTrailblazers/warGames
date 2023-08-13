const { io } = require('socket.io-client');
const { startDriver } = require('./handler.js');

const events = require('ws://localhost:3000');

startDriver(events);
module.exports = { events };
