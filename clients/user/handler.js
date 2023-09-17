const { chance, EventNames } = require('../../utilities');
const inquirer = require('inquirer');
const { io } = require('socket.io-client');

const client = io('ws://localhost:3000');
let attackCity;
let defendCity;
let payload;

// function setNumberOfPlayers(players) {
//   numberOfPlayers = players;
//   console.log(`Number of players set to: ${numberOfPlayers}`);
// }

// client.on('connect', () => {
//   console.log('Connected to the server');
// });
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
    // Ask if the user wants to start the game and enable chat messaging
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
      // Ask how many players the user wants to play with
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
        console.log('You selected 1 player game.');
      } else {
        console.log('You selected 2 player game.');
      }

      // Continue with login logic
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

      // You can access the answers for each question like this:
      const username = loginAnswers.username;
      const password = loginAnswers.password;

      console.log(`Logged in as ${username}`);
      // startUser(client);
      startPlayer1(client, username);
      // Check if chat messaging is enabled and start chat messaging
      if (startGameAnswers.enableChat) {
        // Start the chat messaging system
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

async function startGameLogic(client, payload, username, enableChat) {
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
          message: 'Select your country!:',
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
          message: 'Select your method of attack:',
          choices: ['Air', 'Land', 'Sea'],
        },
      ]);
      const defendCity = attackCoordinatesAnswers.country;
      const attackCity = attackCoordinatesAnswers.coordinates;
      console.log('Attacking ' + attackCity);

      const payload = {
        event: 'gameStart',
        attackSent: 0, // Initialize with 0, update as needed
        clientId: defendCity,
        countryId: attackCity,
        order: {},
        damage: 0, // Initialize with 0, update as needed
        health: 0, // Initialize with 0, update as needed
      };

      // Call the appropriate game function here
      await attackChanceLoop(client, defendCity, attackCity);
      // Further processing related to coordinates
      // if (attackCoordinatesAnswers.sendAttack === 'Yes') {
      //   acknowledgedAttack(payload, client);
      //   sendCoordinates(client);
      // }
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
      // Exit the chat messaging system
      break;
    }

    // Send the message to the server or other players
    client.emit(EventNames.chatMessage, message);

    console.log(`You sent a message: ${message}`);
  }
}

login();

function sendCoordinates(client) {
  inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'attackConfirmed',
        message: 'Do you want to proceed with the attack?',
        default: true,
      },
    ])
    .then((attackAnswers) => {
      if (attackAnswers.attackConfirmed) {
        // Generate the event based on user's answers
        // attackChance();
        // if (numberOfPlayers === 2) {
        //   payload.player = 3 - payload.player; // Toggle between 1 and 2
        // }
        // // Emit the 'gameStart' event to the other player(s)
        // client.emit(EventNames.gameStart, payload);
        // // Wait for the other player's response
        // client.on(EventNames.attackResponse, (responsePayload) =>
        //   handleAttackResponse(responsePayload, client)
        // );
      } else {
        console.log('Goodbye');
      }
    });
}

// function handleAttackResponse(responsePayload, client) {
//   console.log(`Player ${responsePayload.player} responded:`);

//   // Check if the attack was successful or not
//   if (responsePayload.success) {
//     let results = responsePayload.health - responsePayload.damage;
//     console.log(
//       `Player ${responsePayload.player}'s attack hit successfully - Damage: ${responsePayload.damage} - Health Remaining: ${results}`
//     );
//   } else {
//     console.log(`Player ${responsePayload.player}'s attack missed`);
//   }

//   // Continue the game by sending coordinates for the next attack
//   sendCoordinates(client);
// }

// function attackStarting(client) {
//   console.log('Commencing attack!');
//   client.on(EventNames.delivered, (payload) =>
//     acknowledgedAttack(payload, client)
//   );
//   client.on(EventNames.attackFailed, (payload) =>
//     failedAttack(payload, client)
//   );
// }

// Start the game by sending coordinates

// function attackStarting(client) {
//   console.log('Commencing attack!');
//   client.on(EventNames.delivered, (payload) =>
//     acknowledgedAttack(payload, client)
//   );
//   client.on(EventNames.attackFailed, (payload) =>
//     failedAttack(payload, client)
//   );

//   function ready() {
//     sendCoordinates(client);
//     setTimeout(() => {
//       inquirer
//         .prompt([
//           {
//             type: 'list',
//             name: 'sendAttack',
//             message: 'Do you want to send another attack?',
//             choices: ['Yes', 'No'],
//           },
//         ])
//         .then((answers) => {
//           if (answers.name === 'Yes') {
//             acknowledgedAttack(payload, client);
//             sendCoordinates(client);
//           } else {
//             console.log('Goodbye');
//           }
//         });
//     }, chance.integer({ min: 5000, max: 10000 }));
//   }
//   ready();
// }

function acknowledgedAttack(payload, client) {
  // console.log('Target Hit', payload.attackCity);
  // client.emit('received', payload);
  // client.emit(EventNames.delivered, payload);
}

// function ready() {
//   sendCoordinates(client);
//   // setTimeout(ready, chance.integer({ min: 5000, max: 10000 }));
//   // }
//   ready();
// }

async function attackChanceLoop(client, defendCity, attackCity) {
  const successChance = 0.6;

  let health = 10000; // Initialize health to 10000

  while (health > 0) {
    // Generate a random number between 0 and 1
    const randomValue = Math.random();

    const event = {
      damage: Math.floor(Math.random() * (2500 - 1000 + 1)) + 1000, // Generate random damage between 1000 and 2500
      health: health, // Use the current health value
    };

    if (randomValue <= successChance) {
      // Attack is successful
      event.health -= event.damage; // Update the health value
      console.log(
        `${defendCity} has successfully hit ${attackCity} - Damage: ${event.damage} - Health Remaining: ${event.health}`
      );
      // client.emit(EventNames.delivered, payload);
      // client.emit(EventNames.ready);

      const sendAnotherAttackAnswers = await inquirer.prompt([
        {
          type: 'list',
          name: 'sendAttack',
          message: 'Do you want to send another attack?',
          choices: ['Yes', 'No'],
        },
      ]);

      if (sendAnotherAttackAnswers.sendAttack === 'Yes') {
        acknowledgedAttack(payload, client);
        // Update payload.health based on your game logic here
      } else {
        console.log('Goodbye');
        throw new Error('Game ended');
      }
    } else {
      console.log(`${defendCity}'s attack has missed ${attackCity}`);
      // client.emit(EventNames.attackFailed, payload);
      // client.emit(EventNames.ready);
    }

    health = event.health; // Update the health variable with the new value

    if (health <= 0) {
      console.log('Game Over');
      askToPlayAgain();
    }

    sendCoordinates(client); // Call playGame with the updated payload
    // if (!(await askToPlayAgain())) {
    //   console.log('Goodbye');
    //   return; // Exit the entire function if the player chooses not to play again
    // }

    // console.log('Starting a new game...\n');
    // await startPlayer1(client); // Start a new game if the player chooses to play again
  }
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
    // Start the game again
    await startGameLogic(username, enableChat);
  } else {
    // Disconnect the user or perform any other actions
    await disconnect(client);
  }
}

function disconnect(client) {
  // Disconnect the user
  client.disconnect();
}

// function handleSentAttack(payload, client) {
//   console.log(`Waiting for Player ${3 - payload.player}'s response`);

//   setTimeout(
//     () => attackChance(payload, client),
//     chance.integer({ min: 5000, max: 10000 })
//   );
// }

function startPlayer1(client, username) {
  // console.log(`${username} has entered the game.`);
  client.emit(EventNames.ready);

  client.on(EventNames.chatMessage, (message) => {
    console.log(`Received message: ${message}`);
    // You can display the received message in your chat interface
  });
  client.on(EventNames.readyToPlay, () => {
    isWaitingForUserInput = false;
    // attackStarting(client);
    // sendCoordinates(client);
  });
}

module.exports = {
  startPlayer1,
  startChatMessaging,
};
