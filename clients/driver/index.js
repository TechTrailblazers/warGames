'use strict';

const { io } = require('socket.io-client');
const events = require('../../logger.js');
const { driverHandler } = require('./handler');

const client = io('ws://localhost:3000/caps');
client.on(events.announcement, (payload) => console.log(payload.message));
client.on(events.ready, driverHandler);

module.exports = { client };
