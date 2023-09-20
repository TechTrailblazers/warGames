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
      // {
      //   type: 'confirm',
      //   name: 'enableChat',
      //   message: 'Do you want to enable chat messaging?',
      //   default: false,
      // },
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
      username = loginAnswers.username;
      password = loginAnswers.password;

      console.log(`Logged in as ${username}`);
      // startUser(client);
      startPlayer1();
      // Check if chat messaging is enabled and start chat messaging
      // if (startGameAnswers.enableChat) {
      // Start the chat messaging system
      // startChatMessaging(client);
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

async function startGameLogic() {
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
      defendCity = attackCoordinatesAnswers.country;
      attackCity = attackCoordinatesAnswers.coordinates;
      console.log('Attacking ' + attackCity);

      // // Store the selected countries in variables
      // const userDefendCity = defendCity;
      // const userAttackCity = attackCity;

      const userAttackPayload = {
        event: 'gameStart',
        attackSent: 0, // Initialize with 0, update as needed
        clientId: defendCity,
        countryId: attackCity,
        order: {},
        damage: 0, // Initialize with 0, update as needed
        health: 0, // Initialize with 0, update as needed
      };

      // Call the appropriate game function here
      attackChanceLoop(client, defendCity, attackCity, userAttackPayload);

      // // Simulate the computer's attack after the user's attack
      // const computerAttackPayload = generateComputerAttackEvent(
      //   defendCity,
      //   attackCity
      // ); // Pass both cities as arguments
      // performComputerAttack(client, computerAttackPayload);

      // Further processing related to coordinates
      // if (attackCoordinatesAnswers.sendAttack === 'Yes') {
      //   acknowledgedAttack(payload, client);
      //   sendCoordinates(client);
      // }
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
    console.log(message);
    if (message.toLowerCase() === 'exit') {
      return attackChanceLoop();
    }
    // console.log(client);
    // Send the message to the server or other players
    client.emit(EventNames.chatMessage, message);
    return startChatMessaging();
    // console.log(EventNames.chatMessage);
    // console.log(`You sent a message: ${message}`);
  }
}

function calculateUserHealth(damage) {
  // Ensure the health doesn't go below 0
  const newHealth = Math.max(userHealth - damage, 0);
  return newHealth;
}

function calculateComputerHealth(damage) {
  // Ensure the health doesn't go below 0
  const newHealth = Math.max(computerHealth - damage, 0);
  return newHealth;
}
async function attackChanceLoop(client, userAttackPayload) {
  if (userHealth > 0 && computerHealth > 0 && !gameOver) {
    // Generate a random number between 0 and 1
    const randomValue = Math.random();

    const userAttackEvent = {
      damage: Math.floor(Math.random() * (2500 - 1000 + 1)) + 1000,
      health: userHealth,
    };
    let computerHasAttack = false;
    if (randomValue <= successChance) {
      // Attack is successful
      const userDamage = userAttackEvent.damage;
      userHealth = calculateUserHealth(userDamage); // Update user's health
      console.log(
        `${defendCity} has successfully hit ${attackCity} - Damage: ${userDamage} - Health Remaining: ${userHealth}`
      );

      // Simulate the computer's attack after the user's attack
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

  // Calculate the new health after deducting damage
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

function startPlayer1() {
  // console.log(`${username} has entered the game.`);
  client.emit(EventNames.ready);

  client.on(EventNames.chatMessage, (message) => {
    console.log(`Received message: ${message}`);
    // You can display the received message in your chat interface
  });
  client.on(EventNames.readyToPlay, () => {});
}
login();
module.exports = {
  startPlayer1,
  // startChatMessaging,
};
// function handleSentAttack(payload, client) {
//   console.log(`Waiting for Player ${3 - payload.player}'s response`);

//   setTimeout(
//     () => attackChance(payload, client),
//     chance.integer({ min: 5000, max: 10000 })
//   );
// }
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
