const { chance, EventNames } = require('../../utilities');

let numberOfPlayers = 1;
let isWaitingForUserInput = true;

function setNumberOfPlayers(players) {
  numberOfPlayers = players;
  console.log(`Number of players set to: ${numberOfPlayers}`);
}

const inquirer = require('inquirer');
const { io } = require('socket.io-client');

const client = io('ws://localhost:3000');


function login() {
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

  inquirer
    .prompt([
      {
        type: 'list',
        name: 'choices',
        message: 'Do you want to start the game?',
        choices: ['Yes', 'No'],
      },
    ])
    .then((answers) => {
      if (answers.choices === 'Yes') {
        inquirer
          .prompt([
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
          ])
          .then((answers) => {
            startUser(client);
            inquirer
              .prompt([
                {
                  type: 'list',
                  name: 'choices',
                  message: 'Do you want to attack?',
                  choices: ['Yes', 'No'],
                },
              ])
              .then((answers) => {
                if (answers.choices === 'Yes') {
                  inquirer
                    .prompt([
                      {
                        type: 'list',
                        name: 'coordinates',
                        message: 'Select your attacking ',
                        choices: [
                          `${chance.coordinates({
                            fixed: 2,
                          })}`,
                          `${chance.coordinates({
                            fixed: 2,
                          })}`,
                          `${chance.coordinates({
                            fixed: 2,
                          })}`,
                        ],
                      },
                    ])
                    .then((answers) => {
                      console.log(
                        'Attacking on coordinates: ' + answers.coordinates
                      );

                      attackStarting(client);
                    });
                } else {
                  console.log('Goodbye');
                }
              });
          });
      } else {
        console.log('Goodbye');
      }
    });
}

login();


function sendCoordinates(client) {
  if (isWaitingForUserInput) {
    console.log('Waiting for user to enter the number of players (1 or 2):');

    // Listen for user input to set the number of players
    process.stdin.once('data', (input) => {
      const inputNumber = parseInt(input.toString().trim());

      if (inputNumber === 1 || inputNumber === 2) {
        setNumberOfPlayers(inputNumber);
        isWaitingForUserInput = false;
        console.log(`Number of players set to: ${inputNumber}`);
        startGame(client);
      } else {
        console.log('Invalid input. Please enter 1 or 2.');
        sendCoordinates(client); // Continue waiting for valid input
      }
    });

    return;
  }

  const event = {
    country: chance.country({ full: true }),
    coordinates: ` Attacking on coordinates: ${chance.coordinates({
      fixed: 2,
    })}`,
    countryBeingAttack: chance.country({ full: true }),
    typeofAttack: chance.pickone(['Air', 'Land', 'Sea']),
    damage: `${chance.integer({ min: 1000, max: 2500 })}`,
    health: 10000,
  };

  const payload = {
    event: 'gameStart',
    attackSent: event.damage,
    messageId: event.orderId,
    clientId: event.country,
    countryId: event.countryBeingAttack,
    order: event,
    damage: event.damage,
    health: event.health,
    player: 1, // Player 1's turn
  };
  console.log(
    'Player 1 has sent an attack!',
    payload.clientId,
    'is attacking',
    payload.countryId
  );

  if (numberOfPlayers === 2) {
    payload.player = 3 - payload.player; // Toggle between 1 and 2
  }

  // Emit the 'gameStart' event to the other player(s)
  client.emit(EventNames.gameStart, payload);

  // Wait for the other player's response
  client.on(EventNames.attackResponse, (responsePayload) =>
    handleAttackResponse(responsePayload, client)
  );
}
function handleAttackResponse(responsePayload, client) {
  console.log(`Player ${responsePayload.player} responded:`);

  // Check if the attack was successful or not
  if (responsePayload.success) {
    let results = responsePayload.health - responsePayload.damage;
    console.log(
      `Player ${responsePayload.player}'s attack hit successfully - Damage: ${responsePayload.damage} - Health Remaining: ${results}`
    );
  } else {
    console.log(`Player ${responsePayload.player}'s attack missed`);
  }

  // Continue the game by sending coordinates for the next attack
  sendCoordinates(client);
}
function attackStarting(client) {
  console.log('Commencing attack!');
  client.on(EventNames.delivered, (payload) =>
    acknowledgedAttack(payload, client)
  );
  client.on(EventNames.attackFailed, (payload) =>
    failedAttack(payload, client)
  );


  // Start the game by sending coordinates
  sendCoordinates(client);


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
  console.log('Target Hit', payload.countryId);
  client.emit('received', payload);
  // client.emit(EventNames.delivered, payload);

}

function ready() {
  sendCoordinates(client);
  // setTimeout(ready, chance.integer({ min: 5000, max: 10000 }));
  // }
  ready();
}

function attackChance(payload, client) {
  // Define the success chance threshold (e.g., 0.7 for a 70% success chance)
  const successChance = 0.6;

  // Generate a random number between 0 and 1
  const randomValue = Math.random();

  if (randomValue <= successChance) {
    // Attack is successful
    let results = payload.health - payload.damage;
    console.log(
      "Player 1's attack has hit successfully",
      payload.countryId,
      '-',
      'Damage:',
      payload.damage,
      '-',
      'Health Remaining:',
      results
    );
    client.emit(EventNames.delivered, payload);
    client.emit(EventNames.ready);
  } else {
    // Attack is unsuccessful
    console.log("Player 1's attack has missed", payload.countryId);
    client.emit(EventNames.attackFailed, payload);
    client.emit(EventNames.ready);
  }
}

function handleSentAttack(payload, client) {

  console.log(`Waiting for Player ${3 - payload.player}'s response`);

  setTimeout(
    () => attackChance(payload, client),
    chance.integer({ min: 5000, max: 10000 })
  );
}
function startPlayer1(client) {
  console.log(`Player 1 (ID: ${client.id}) has entered the game`);
  client.emit(EventNames.ready);
  client.on(EventNames.chatMessage, (message) => {
    client.emit(EventNames.chatMessage, message);
  });
  // client.on(EventNames.chatMessage, (message) => {
  //   console.log(`Player (ID: ${client.id}) sent a message: ${message.message}`);
  // });
  client.on(EventNames.readyToPlay, () => {
    isWaitingForUserInput = false;
    attackStarting(client);
  });
}

module.exports = {
  startPlayer1,
};
