const { startUser, attackStarting } = require('./handler.js');
const { io } = require('socket.io-client');

const client = io('ws://localhost:3000');

startUser(client);
attackStarting(client);
