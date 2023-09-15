const { startServer } = require('./hub.js');
const { startDriver } = require('./clients/user/handler.js');
const { io } = require('socket.io-client');

const client = io('ws://localhost:3000');

const inquirer = require('inquirer');

function login() {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Enter your username:',
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter your password:',
      mask: '*',
    },
  ]);
}

login();

startServer();
startDriver(client);
