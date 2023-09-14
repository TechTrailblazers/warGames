import inquirer from 'inquirer';
import { startSocketServer } from './serverInquirer.js';

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

function startGame() {
  return inquirer.prompt([
    {
      type: 'confirm',
      name: 'start',
      message: 'Do you want to start a game? (yes/no)',
    },
  ]);
}

async function main() {
  try {
    console.log(`


░██╗░░░░░░░██╗███████╗██╗░░░░░░█████╗░░█████╗░███╗░░░███╗███████╗  ████████╗░█████╗░  ░██╗░░░░░░░██╗░█████╗░██████╗░
░██║░░██╗░░██║██╔════╝██║░░░░░██╔══██╗██╔══██╗████╗░████║██╔════╝  ╚══██╔══╝██╔══██╗  ░██║░░██╗░░██║██╔══██╗██╔══██╗
░╚██╗████╗██╔╝█████╗░░██║░░░░░██║░░╚═╝██║░░██║██╔████╔██║█████╗░░  ░░░██║░░░██║░░██║  ░╚██╗████╗██╔╝███████║██████╔╝
░░████╔═████║░██╔══╝░░██║░░░░░██║░░██╗██║░░██║██║╚██╔╝██║██╔══╝░░  ░░░██║░░░██║░░██║  ░░████╔═████║░██╔══██║██╔══██╗
░░╚██╔╝░╚██╔╝░███████╗███████╗╚█████╔╝╚█████╔╝██║░╚═╝░██║███████╗  ░░░██║░░░╚█████╔╝  ░░╚██╔╝░╚██╔╝░██║░░██║██║░░██║
░░░╚═╝░░░╚═╝░░╚══════╝╚══════╝░╚════╝░░╚════╝░╚═╝░░░░░╚═╝╚══════╝  ░░░╚═╝░░░░╚════╝░  ░░░╚═╝░░░╚═╝░░╚═╝░░╚═╝╚═╝░░╚═╝

░██████╗░░█████╗░███╗░░░███╗███████╗░██████╗
██╔════╝░██╔══██╗████╗░████║██╔════╝██╔════╝
██║░░██╗░███████║██╔████╔██║█████╗░░╚█████╗░
██║░░╚██╗██╔══██║██║╚██╔╝██║██╔══╝░░░╚═══██╗
╚██████╔╝██║░░██║██║░╚═╝░██║███████╗██████╔╝
░╚═════╝░╚═╝░░╚═╝╚═╝░░░░░╚═╝╚══════╝╚═════╝░

    `);

    // Login
    const loginInfo = await login();
    console.log(`Logged in as ${loginInfo.username}`);
    startSocketServer();

    const startGameResponse = await startGame();

    if (startGameResponse.start) {
      console.log('Starting the game...');

      const countryAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'country',
          message: 'Which country do you want to play?',
          choices: ['USA', 'Canada', 'Mexico'],
        },
      ]);

      console.log(countryAnswer.country);

      const attackAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'type',
          message: 'What type of Attack do you want to use?',
          choices: ['Air', 'Land', 'Sea'],
        },
      ]);

      console.log(attackAnswer.type);
      console.log(`Your ${attackAnswer.type} attack was successful!`);
      console.log('Your enemy lost 10 points!');

      console.log('Waiting on enemy response...');

      const enemyResponse = await inquirer.prompt([
        {
          type: 'list',
          name: 'response',
          message: 'What type of Attack do you want to use?',
          choices: ['Air', 'Land', 'Sea'],
        },
      ]);
      console.log('Enemy responded!');
      setTimeout(() => {
        console.log(`Your enemy used ${enemyResponse.response} attack!`);
        console.log('You lost 10 points!');
      }, 4000);
    } else {
      console.log('Goodbye!');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();
