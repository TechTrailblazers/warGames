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

      // Store the selected countries in variables
      const userDefendCity = defendCity;
      const userAttackCity = attackCity;

      const userAttackPayload = {
        event: 'gameStart',
        attackSent: 0, // Initialize with 0, update as needed
        clientId: userDefendCity,
        countryId: userAttackCity,
        order: {},
        damage: 0, // Initialize with 0, update as needed
        health: 0, // Initialize with 0, update as needed
      };

      // Call the appropriate game function here
      await attackChanceLoop(
        client,
        userDefendCity,
        userAttackCity,
        userAttackPayload
      );

      // Simulate the computer's attack after the user's attack
      const computerAttackPayload = generateComputerAttackEvent(
        userDefendCity,
        userAttackCity
      ); // Pass both cities as arguments
      await performComputerAttack(client, computerAttackPayload);

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

// function sendCoordinates(client, attackChanceLoopCallback) {
//   inquirer
//     .prompt([
//       {
//         type: 'confirm',
//         name: 'attackConfirmed',
//         message: 'Do you want to proceed with the attack?',
//         default: true,
//       },
//     ])
//     .then((attackAnswers) => {
//       if (attackAnswers.attackConfirmed) {
//         // Call the attackChanceLoop with the callback
//         attackChanceLoopCallback();
//       } else {
//         console.log('Goodbye');
//         // You can also handle game termination here if needed.
//       }
//     });
// }

function calculateUserHealth(currentHealth, damage) {
  // Ensure the health doesn't go below 0
  const newHealth = Math.max(currentHealth - damage, 0);
  return newHealth;
}

function calculateComputerHealth(currentHealth, damage) {
  // Ensure the health doesn't go below 0
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

  let userHealth = 10000; // Initialize user's health to 10000
  let computerHealth = 10000;

  while (userHealth > 0 && computerHealth > 0) {
    // Generate a random number between 0 and 1
    const randomValue = Math.random();

    const userAttackEvent = {
      damage: Math.floor(Math.random() * (2500 - 1000 + 1)) + 1000,
      health: userHealth,
    };

    if (randomValue <= successChance) {
      // Attack is successful
      const userDamage = userAttackEvent.damage;
      userHealth = calculateUserHealth(userHealth, userDamage); // Update user's health
      // computerHealth = calculateComputerHealth(computerHealth, userDamage); // Update computer's health
      console.log(
        `${defendCity} has successfully hit ${attackCity} - Damage: ${userDamage} - Health Remaining: ${userHealth}`
      );

      // Simulate the computer's attack after the user's attack
      const computerAttackEvent = generateComputerAttackEvent(
        defendCity,
        attackCity,
        computerHealth
      );

      if (computerAttackEvent.success) {
        // Only update computer's health if the attack is successful
        const computerDamage = computerAttackEvent.damage;
        computerHealth = calculateComputerHealth(
          computerHealth,
          computerDamage
        ); // Update computer's health
      }

      await performComputerAttack(client, computerAttackEvent);

      if (userHealth <= 0 || computerHealth <= 0) {
        console.log('Game Over');
        askToPlayAgain();
        return; // Exit the loop and the function
      }
    } else {
      console.log(`${defendCity}'s attack has missed ${attackCity}`);

      // Simulate the computer's attack after the user's attack
      const computerAttackEvent = generateComputerAttackEvent(
        defendCity,
        attackCity,
        computerHealth
      );

      if (computerAttackEvent.success) {
        // Only update computer's health if the attack is successful
        const computerDamage = computerAttackEvent.damage;
        computerHealth = calculateComputerHealth(
          computerHealth,
          computerDamage
        ); // Update computer's health
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

// function acknowledgedAttack(payload, client) {
//   // console.log('Target Hit', payload.attackCity);
//   // client.emit('received', payload);
//   // client.emit(EventNames.delivered, payload);
// }

// function ready() {
//   sendCoordinates(client);
//   // setTimeout(ready, chance.integer({ min: 5000, max: 10000 }));
//   // }
//   ready();
// }

// async function attackChanceLoop(
//   client,
//   defendCity,
//   attackCity,
//   userAttackPayload
// ) {
//   const successChance = 0.6;

//   let userHealth = 10000; // Initialize user's health to 10000
//   let computerHealth = 10000;

//   while (userHealth > 0 && computerHealth > 0) {
//     // Generate a random number between 0 and 1
//     const randomValue = Math.random();

//     const userAttackEvent = {
//       damage: Math.floor(Math.random() * (2500 - 1000 + 1)) + 1000,
//       health: userHealth,
//     };

//     if (randomValue <= successChance) {
//       // Attack is successful
//       userAttackEvent.health -= userAttackEvent.damage; // Update the health value
//       computerHealth -= userAttackEvent.damage;
//       console.log(
//         `${defendCity} has successfully hit ${attackCity} - Damage: ${userAttackEvent.damage} - Health Remaining: ${userAttackEvent.health}`
//       );

//       // Simulate the computer's attack after the user's attack
//       const computerAttackEvent = generateComputerAttackEvent(
//         defendCity,
//         attackCity,
//         computerHealth
//       );

//       await performComputerAttack(client, computerAttackEvent);

//       // Continue with user's attack
//       const sendAnotherAttackAnswers = await inquirer.prompt([
//         {
//           type: 'list',
//           name: 'sendAttack',
//           message: 'Do you want to send another attack?',
//           choices: ['Yes', 'No'],
//         },
//       ]);

//       if (sendAnotherAttackAnswers.sendAttack === 'Yes') {
//         userAttackPayload.damage = userAttackEvent.damage; // Update the user's attack damage
//         await attackChanceLoop(
//           client,
//           defendCity,
//           attackCity,
//           userAttackPayload
//         );
//       } else {
//         console.log('Goodbye');
//         throw new Error('Game ended');
//       }
//     } else {
//       console.log(`${defendCity}'s attack has missed ${attackCity}`);
//       // Continue with user's attack
//       const sendAnotherAttackAnswers = await inquirer.prompt([
//         {
//           type: 'list',
//           name: 'sendAttack',
//           message: 'Do you want to send another attack?',
//           choices: ['Yes', 'No'],
//         },
//       ]);

//       if (sendAnotherAttackAnswers.sendAttack === 'Yes') {
//         userAttackPayload.damage = userAttackEvent.damage; // Update the user's attack damage
//         await attackChanceLoop(
//           client,
//           defendCity,
//           attackCity,
//           userAttackPayload
//         );
//       } else {
//         console.log('Goodbye');
//         throw new Error('Game ended');
//       }
//     }
//     userHealth = userAttackEvent.health;
//     computerHealth = computerAttackEvent.health;

//     if (userHealth <= 0 || computerHealth <= 0) {
//       console.log('Game Over');
//       askToPlayAgain();
//     }

//     sendCoordinates(client, userAttackPayload); // Call playGame with the updated payload
//   }
// }

async function performComputerAttack(client, computerAttackPayload) {
  // Simulate the computer's attack logic here
  // You can generate the attack payload and send it to the user
  // console.log('Simulating computer attack:');
  // console.log(computerAttackPayload);
  // You can emit the attack event to send it to the user
  // client.emit('computerAttackEvent', computerAttackPayload);
}

function generateComputerAttackEvent(defendCity, attackCity, currentHealth) {
  const successChance = 0.7;
  const damage = Math.floor(Math.random() * (2500 - 1000 + 1)) + 1000;

  const isSuccessful = Math.random() <= successChance;

  // Calculate the new health after deducting damage
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
