const { io } = require('socket.io-client');

const client = io('ws://localhost:3000');
const { vendorStart } = require('./handler');

module.exports = { client };
vendorStart(client);
