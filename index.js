const { startServer } = require('./hub.js');
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
