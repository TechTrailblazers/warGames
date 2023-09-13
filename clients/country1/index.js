const { io } = require('socket.io-client');
const client = io('ws://localhost:3000');
const { attackStarting } = require('./handler');

module.exports = { client };
attackStarting(client);
