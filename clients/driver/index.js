const { startDriver } = require('./handler.js');
const { io } = require('socket.io-client');

const events = require('ws://localhost:3000');

startDriver(events);
