const { chance, EventNames } = require('../../utilities');
const inquirer = require('inquirer');
const { io } = require('socket.io-client');

const client = io('ws://localhost:3000');
// client.on('connect', () => {
//   console.log('Connected to the server');
// });

// client.on('error', (error) => {
//   console.error('Error connecting to the server:', error);
// });

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
  };
  console.log(
    'User has sent attack!',
    payload.clientId,
    'is attacking',
    payload.countryId
  );

  client.emit(EventNames.gameStart, payload);
  client.emit('received', payload);
}

function attackStarting(client) {
  console.log('Commencing attack!');
  client.on(EventNames.delivered, (payload) =>
    acknowledgedAttack(payload, client)
  );
  client.on(EventNames.attackFailed, (payload) =>
    failedAttack(payload, client)
  );

  function ready() {
    sendCoordinates(client);
    setTimeout(ready, chance.integer({ min: 5000, max: 10000 }));
  }
  ready();
}

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
function failedAttack(payload, client) {
  console.log('Target Missed', payload.countryId);
  client.emit('received', payload);
  // client.emit(EventNames.delivered, payload);
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
      'Users attack has hit successfully',
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
    console.log("User's attack has missed", payload.countryId);
    client.emit(EventNames.attackFailed, payload);
    // client.emit(EventNames.delivered, payload);
    client.emit(EventNames.ready);
  }
}

function handleSentAttack(payload, client) {
  // console.log('Waiting on enemy response');
  setTimeout(
    () => attackChance(payload, client),
    chance.integer({ min: 5000, max: 10000 })
  );
}

function startUser(client) {
  console.log('User has Started Game');
  client.emit(EventNames.ready);
  client.on(EventNames.gameStart, (payload) =>
    handleSentAttack(payload, client)
  );
}

module.exports = {
  attackStarting,
  startUser,
};
