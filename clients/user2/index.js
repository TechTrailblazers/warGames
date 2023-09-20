const { chance, EventNames } = require('../../utilities');
const inquirer = require('inquirer');
const { io } = require('socket.io-client');

const client = io('ws://localhost:3000');

client.on(EventNames.delivered, (payload) => {
  console.log('Delivered event received:', payload);
});

client.on(EventNames.ready, () => {
  console.log('Ready event received');
});

async function login() {
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

  try {
    const startGameAnswers = await inquirer.prompt([
      {
        type: 'list',
        name: 'startGame',
        message: 'Do you want to start the game?',
        choices: ['Yes', 'No'],
      },
      {
        type: 'confirm',
        name: 'enableChat',
        message: 'Do you want to enable chat messaging?',
        default: false,
      },
    ]);
    if (startGameAnswers.startGame === 'Yes') {
      const numPlayersAnswers = await inquirer.prompt([
        {
          type: 'list',
          name: 'numPlayers',
          message: 'How many players do you want to play with? (1 or 2)',
          choices: ['1', '2'],
        },
      ]);
      const numPlayers = parseInt(numPlayersAnswers.numPlayers);

      if (numPlayers === 1) {
        // Inside your client code
        // client.on(EventNames.gameStart, () => {
        //   console.log('Game has started!');
        //   // Add your game logic here
        // });

        console.log('You selected 1 player game.');
        client.emit('gameStart');
        // console.log('CLIENT', client);
        // console.log('Emitting gameStart event');
      } else {
        console.log('You selected 2 player game.');
        client.emit('gameStart');
      }

      const loginAnswers = await inquirer.prompt([
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

      const username = loginAnswers.username;
      const password = loginAnswers.password;

      console.log(`Logged in as ${username}`);
      client.emit(EventNames.ready, { username });

      startPlayer2(client, username);

      if (startGameAnswers.enableChat) {
        startChatMessaging(client);
      }

      await startGameLogic(client, username, startGameAnswers.enableChat);
    }
  } catch (error) {
    if (error.message !== 'Game ended') {
      console.error('An error occurred:', error);
    }
  }
}

async function startGameLogic(client, username, enableChat) {
  try {
    const attackAnswers = await inquirer.prompt([
      {
        type: 'list',
        name: 'choices',
        message: 'Do you want to attack?',
        choices: ['Yes', 'No'],
      },
    ]);

    if (attackAnswers.choices === 'Yes') {
      const attackCoordinatesAnswers = await inquirer.prompt([
        {
          type: 'list',
          name: 'country',
          message: 'Select your attacking country:',
          choices: [
            `${chance.country({ full: true })}`,
            `${chance.country({ full: true })}`,
            `${chance.country({ full: true })}`,
          ],
        },
        {
          type: 'list',
          name: 'coordinates',
          message: 'Select your country to attack!:',
          choices: [
            `${chance.country({ full: true })}`,
            `${chance.country({ full: true })}`,
            `${chance.country({ full: true })}`,
          ],
        },
        {
          type: 'list',
          name: 'type of attack',
          message: 'Select your method of attack!:',
          choices: ['Air', 'Land', 'Sea'],
        },
      ]);
      const defendCity = attackCoordinatesAnswers.country;
      const attackCity = attackCoordinatesAnswers.coordinates;
      console.log('Attacking : ' + attackCity);

      const userDefendCity = defendCity;
      const userAttackCity = attackCity;

      const userAttackPayload = {
        event: 'gameStart',
        attackSent: 0,
        clientId: userDefendCity,
        countryId: userAttackCity,
        order: {},
        damage: 0,
        health: 0,
      };
      await attackChanceLoop(
        client,
        userDefendCity,
        userAttackCity,
        userAttackPayload
      );

      const computerAttackPayload = generateComputerAttackEvent(
        userDefendCity,
        userAttackCity
      );
      await performComputerAttack(client, computerAttackPayload);
    } else {
      console.log('Goodbye');
    }
  } catch (error) {
    if (error.message !== 'Game ended') {
      console.error('An error occurred:', error);
    }
  }
}

async function startChatMessaging(client) {
  while (true) {
    const messageAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: 'Enter your message (or type "exit" to quit chat):',
      },
    ]);
    const message = messageAnswers.message;

    if (message.toLowerCase() === 'exit') {
      break;
    }

    client.emit(EventNames.chatMessage, message);

    console.log(`You sent a message: ${message}`);
  }
}

login();

function calculateUserHealth(currentHealth, damage) {
  const newHealth = Math.max(currentHealth - damage, 0);
  return newHealth;
}

function calculateComputerHealth(currentHealth, damage) {
  const newHealth = Math.max(currentHealth - damage, 0);
  return newHealth;
}

async function attackChanceLoop(
  client,
  defendCity,
  attackCity,
  userAttackPayload
) {
  const successChance = 0.6;

  let userHealth = 10000;
  let computerHealth = 10000;

  while (userHealth > 0 && computerHealth > 0) {
    const randomValue = Math.random();

    const userAttackEvent = {
      damage: Math.floor(Math.random() * (2500 - 1000 + 1)) + 1000,
      health: userHealth,
    };

    if (randomValue <= successChance) {
      const userDamage = userAttackEvent.damage;
      userHealth = calculateUserHealth(userHealth, userDamage);
      console.log(
        `${defendCity} has successfully hit ${attackCity} - Damage: ${userDamage} - Health Remaining: ${userHealth}`
      );

      const computerAttackEvent = generateComputerAttackEvent(
        defendCity,
        attackCity,
        computerHealth
      );

      if (computerAttackEvent.success) {
        const computerDamage = computerAttackEvent.damage;
        computerHealth = calculateComputerHealth(
          computerHealth,
          computerDamage
        );
      }

      await performComputerAttack(client, computerAttackEvent);

      if (userHealth <= 0 || computerHealth <= 0) {
        console.log('Game Over');
        askToPlayAgain();
        return;
      }
    } else {
      console.log(`${defendCity}'s attack has missed ${attackCity}`);
      client.on(EventNames.attackFailed, (payload) => {
        console.log('Attack failed event received:', payload);
      });
      const computerAttackEvent = generateComputerAttackEvent(
        defendCity,
        attackCity,
        computerHealth
      );

      if (computerAttackEvent.success) {
        const computerDamage = computerAttackEvent.damage;
        computerHealth = calculateComputerHealth(
          computerHealth,
          computerDamage
        );
      }

      await performComputerAttack(client, computerAttackEvent);
    }

    const sendAnotherAttackAnswers = await inquirer.prompt([
      {
        type: 'list',
        name: 'sendAttack',
        message: 'Do you want to send another attack?',
        choices: ['Yes', 'No'],
      },
    ]);

    if (sendAnotherAttackAnswers.sendAttack === 'No') {
      console.log('Goodbye');
      throw new Error('Game ended');
    }
  }
}

async function performComputerAttack(client, computerAttackPayload) {}

function generateComputerAttackEvent(defendCity, attackCity, currentHealth) {
  const successChance = 0.7;
  const damage = Math.floor(Math.random() * (2500 - 1000 + 1)) + 1000;

  const isSuccessful = Math.random() <= successChance;

  const newHealth = calculateComputerHealth(currentHealth, damage);

  if (isSuccessful) {
    console.log(
      `${attackCity} (Computer) has successfully hit ${defendCity} - Damage: ${damage} - Health Remaining: ${newHealth}`
    );

    if (newHealth <= 0) {
      console.log(`${defendCity} is defeated!`);
    }
  } else {
    console.log(`${attackCity} (Computer)'s attack has missed ${defendCity}`);
  }

  return {
    success: isSuccessful,
    damage: damage,
    health: newHealth,
  };
}

async function askToPlayAgain(username, enableChat) {
  let playAgainAnswers = await inquirer.prompt([
    {
      type: 'list',
      name: 'playAgain',
      message: 'Do you want to play again?',
      choices: ['Yes', 'No'],
    },
  ]);

  if (playAgainAnswers.playAgain === 'Yes') {
    await startGameLogic(username, enableChat);
  } else {
    await disconnect(client);
  }
}

function disconnect(client) {
  client.disconnect();
}

function startPlayer2(client, username) {
  client.emit(EventNames.ready);

  client.on(EventNames.chatMessage, (message) => {
    console.log(`Received message: ${message}`);
  });
  client.on(EventNames.readyToPlay, () => {
    isWaitingForUserInput = false;
  });
  client.on(EventNames.gameStart, () => console.log('Game has started 365'));
}

startPlayer2(client);

module.exports = {
  startPlayer2,
  startChatMessaging,
};
