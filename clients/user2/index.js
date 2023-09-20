const { chance, EventNames } = require('../../utilities');
const inquirer = require('inquirer');
const { io } = require('socket.io-client');

const client = io('ws://localhost:3000');

let attackCity;
let defendCity;
let username;
let password;
let payload;
let gameOver = false;
let userHealth = 10000; // Initialize user's health to 10000
let computerHealth = 10000;
let successChance = Math.random();

client.on(EventNames.delivered, (payload) => {
  console.log('Delivered event received:', payload);
  // Handle the 'delivered' event
});

client.on(EventNames.attackFailed, (payload) => {
  console.log('Attack failed event received:', payload);
  // Handle the 'attackFailed' event
});

client.on(EventNames.ready, () => {
  console.log('Ready event received');
  // Handle the 'ready' event
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
      // {
      //   type: 'confirm',
      //   name: 'enableChat',
      //   message: 'Do you want to enable chat messaging?',
      //   default: false,
      // },
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

      username = loginAnswers.username;
      password = loginAnswers.password;

      console.log(`Logged in as ${username}`);
      client.emit(EventNames.ready, { username });

      startPlayer2(client, username);

      // if (startGameAnswers.enableChat) {
      //   startChatMessaging(client);
      // }

      // await startGameLogic(client, username, startGameAnswers.enableChat);
      startGameLogic();
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
        choices: ['Yes', 'No', 'Chat'],
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
      defendCity = attackCoordinatesAnswers.country;
      attackCity = attackCoordinatesAnswers.coordinates;
      console.log('Attacking : ' + attackCity);

      // const userDefendCity = defendCity;
      // const userAttackCity = attackCity;

      const userAttackPayload = {
        event: 'gameStart',
        attackSent: 0,
        clientId: defendCity,
        countryId: attackCity,
        order: {},
        damage: 0,
        health: 0,
      };
      attackChanceLoop(client, defendCity, attackCity, userAttackPayload);

      // const computerAttackPayload = generateComputerAttackEvent(
      //   userDefendCity,
      //   userAttackCity
      // );
    } else if (attackAnswers.choices === 'Chat') {
      startChatMessaging();
    } else {
      console.log('Goodbye');
    }
  } catch (error) {
    if (error.message !== 'Game ended') {
      console.error('An error occurred:', error);
    }
  }
}

async function startChatMessaging() {
  while (client) {
    const messageAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: 'Enter your message (or type "exit" to quit chat):',
      },
    ]);
    const message = messageAnswers.message;

    if (message.toLowerCase() === 'exit') {
      return attackChanceLoop();
    }

    client.emit(EventNames.chatMessage, { message, sender: 'user2' });
    return startChatMessaging();
  }
}

function calculateUserHealth(damage) {
  const newHealth = Math.max(userHealth - damage, 0);
  return newHealth;
}

function calculateComputerHealth(damage) {
  const newHealth = Math.max(computerHealth - damage, 0);
  return newHealth;
}

async function attackChanceLoop(client, userAttackPayload) {
  if (userHealth > 0 && computerHealth > 0 && !gameOver) {
    const randomValue = Math.random();

    const userAttackEvent = {
      damage: Math.floor(Math.random() * (2500 - 1000 + 1)) + 1000,
      health: userHealth,
    };
    let computerHasAttack = false;
    if (randomValue <= successChance) {
      const userDamage = userAttackEvent.damage;
      userHealth = calculateUserHealth(userDamage);
      console.log(
        `${defendCity} has successfully hit ${attackCity} - Damage: ${userDamage} - Health Remaining: ${userHealth}`
      );

      if (!gameOver) {
        try {
          const computerAttackEvent =
            generateComputerAttackEvent(computerHealth);

          if (computerAttackEvent.success) {
            // Only update computer's health if the attack is successful
            const computerDamage = computerAttackEvent.damage;
            computerHealth = calculateComputerHealth(computerDamage); // Update computer's health
          }

          computerHasAttack = await performComputerAttack(
            client,
            computerAttackEvent
          );
        } catch (error) {
          console.log(
            'catching the error',
            userHealth,
            computerHealth,
            gameOver
          );
          if (error.message === 'Game over') {
            gameOver = true;
            return; // Exit the loop and the function
          } else {
            // Handle other errors if needed
            console.error('An error occurred:', error);
          }
        }
      }
    } else {
      console.log(`${defendCity}'s attack has missed ${attackCity}`);

      // Simulate the computer's attack after the user's attack
      const computerAttackEvent = generateComputerAttackEvent();

      if (computerAttackEvent.success) {
        // Only update computer's health if the attack is successful
        const computerDamage = computerAttackEvent.damage;
        computerHealth = calculateComputerHealth(computerDamage); // Update computer's health
      }
      computerHasAttack = await performComputerAttack(
        client,
        computerAttackEvent
      );
    }
    if (computerHasAttack) {
      if (userHealth <= 0 || computerHealth <= 0) {
        if (userHealth <= 0) {
          console.log(`${attackCity} is defeated!`);
        }
        console.log('Game Over');

        gameOver = true;
        await askToPlayAgain();
        return; // Exit the loop
      }

      const sendAnotherAttackAnswers = await inquirer.prompt([
        {
          type: 'list',
          name: 'sendAttack',
          message: 'Do you want to send another attack?',
          choices: ['Yes', 'No', 'Chat'],
        },
      ]);
      if (sendAnotherAttackAnswers.sendAttack === 'Yes') {
        attackChanceLoop();
      }
      if (sendAnotherAttackAnswers.sendAttack === 'Chat') {
        console.log('answer was chat');
        startChatMessaging();
        return;
      } else if (sendAnotherAttackAnswers.sendAttack === 'No') {
        console.log('Goodbye');
        gameOver = true; // Set game over state to true
        return; // No need to throw an error here
      }
    }
  }

  // Check for game over and prompt to play again
  if (gameOver) {
    await askToPlayAgain();
  }
}

async function performComputerAttack(
  client,
  computerHealth,
  username,
  enableChat
) {
  if (gameOver) return true;
  // Check if the game is over
  if (computerHealth <= 0) {
    // Game over, prompt the user to play again
    await askToPlayAgain(username, enableChat);
  }
  return true;
}

function generateComputerAttackEvent() {
  const damage = Math.floor(Math.random() * (2500 - 1000 + 1)) + 1000;

  const isSuccessful = Math.random() <= successChance;

  const newHealth = calculateComputerHealth(damage);

  if (isSuccessful) {
    console.log(
      `${attackCity} (Computer) has successfully hit ${defendCity} - Damage: ${damage} - Health Remaining: ${newHealth}`
    );

    if (newHealth <= 0) {
      console.log(`${defendCity} is defeated!`);
    }
  } else {
    if (gameOver) {
      console.log('Game Over!');
      return;
    }
    console.log(`${attackCity} (Computer)'s attack has missed ${defendCity}`);
  }

  return {
    success: isSuccessful,
    damage: damage,
    health: newHealth,
  };
}

async function askToPlayAgain() {
  let playAgainAnswers = await inquirer.prompt([
    {
      type: 'list',
      name: 'playAgain',
      message: 'Do you want to play again?',
      choices: ['Yes', 'No'],
    },
  ]);
  attackCity = '';
  defendCity = '';
  gameOver = false;
  userHealth = 10000; // Initialize user's health to 10000
  computerHealth = 10000;
  successChance = Math.random();
  if (playAgainAnswers.playAgain === 'Yes') {
    // Start the game again

    startGameLogic();
  } else {
    // Disconnect the user or perform any other actions
    await disconnect();
  }
}
function disconnect() {
  // Disconnect the user
  console.log('Thanks for playing!');
  client.disconnect();
}

function startPlayer2(client, username) {
  client.emit(EventNames.ready, 'user2');

  client.on(EventNames.chatMessage, (message) => {
    console.log(`Received message: ${message}`);
  });
  client.on(EventNames.readyToPlay, () => {
    isWaitingForUserInput = false;
  });
  client.on(EventNames.gameStart, () => console.log('Game has started 365'));
}
login();
startPlayer2(client);

module.exports = {
  startPlayer2,
  startChatMessaging,
};
