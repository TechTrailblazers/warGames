const { io } = require('socket.io-client');
const events = require('../../utilities');
const { driverHandler } = require('./handler.js');

const client = io('ws://localhost:3000/caps');

client.on(events.announcement, (payload) => console.log(payload.message));
client.on(events.ready, (payload) => driverHandler(payload, client));

module.exports = { client };
