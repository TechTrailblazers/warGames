const { chance, EventNames } = require('../../utilities');
let currentPlayer = 2;
let isWaitingForUserInput = true;

function receiveAttack(client) {
  // Check if we are waiting for user input
  if (isWaitingForUserInput) {
    console.log('Player 2 is waiting for the user to enter their information.');
    return;
  }

  console.log(`Player 2 is waiting for an attack...`);

  // Listen for the 'gameStart' event from Player 1
  client.on(EventNames.gameStart, (payload) => {
    if (payload.player === currentPlayer) {
      // It's Player 2's turn to respond
      console.log(`Player 2 received an attack from Player 1`);

      // Simulate a response to the attack
      const response = {
        player: currentPlayer,
        success: Math.random() <= 0.6, // Simulate a 60% success rate
        damage: chance.integer({ min: 1000, max: 2500 }),
        health: 10000,
      };

      // Emit the 'attackResponse' event with the response payload
      client.emit(EventNames.attackResponse, response);

      // Emit the 'ready' event to signal that Player 2 is ready for their turn
      setTimeout(() => {
        client.emit(EventNames.ready);
      }, chance.integer({ min: 5000, max: 10000 }));
    }
  });
}

function startPlayer2(client) {
  console.log(`Player 2 (ID: ${client.id}) has entered the game.`);
  client.emit(EventNames.ready);

  // Set the waiting state to false when the user is ready to play
  client.on(EventNames.readyToPlay, () => {
    isWaitingForUserInput = false;
    receiveAttack(client);
  });

  client.on(EventNames.chatMessage, (message) => {
    client.emit(EventNames.chatMessage, message);
  });

  // client.on(EventNames.chatMessage, (message) => {
  //   console.log(`Player (ID: ${client.id}) sent a message: ${message.message}`);
  // });
}

module.exports = {
  startPlayer2,
};

// const { chance, EventNames } = require('../../utilities');

// function sendCoordinates(client) {
//   const event = {
//     country: chance.country({ full: true }),
//     coordinates: ` Attacking on coordinates: ${chance.coordinates({
//       fixed: 2,
//     })}`,
//     countryBeingAttack: chance.country({ full: true }),
//     typeofAttack: chance.pickone(['Air', 'Land', 'Sea']),
//     damage: `${chance.integer({ min: 1000, max: 2500 })}`,
//     health: 10000,
//   };

//   const payload = {
//     event: 'gameStart',
//     attackSent: event.damage,
//     messageId: event.orderId,
//     clientId: event.country,
//     countryId: event.countryBeingAttack,
//     order: event,
//     damage: event.damage,
//     health: event.health,
//   };
//   console.log(
//     'User has sent attack!',
//     payload.clientId,
//     'is attacking',
//     payload.countryId
//   );

//   client.emit(EventNames.gameStart, payload);
//   client.emit('received', payload);
// }

// function attackStarting(client) {
//   console.log('Commencing attack!');
//   client.on(EventNames.delivered, (payload) =>
//     acknowledgedAttack(payload, client)
//   );
//   client.on(EventNames.attackFailed, (payload) =>
//     failedAttack(payload, client)
//   );
//   function acknowledgedAttack(payload, client) {
//     client.emit('received', payload);
//   }
//   function failedAttack(payload, client) {
//     client.emit('received', payload);
//   }

//   function ready() {
//     sendCoordinates(client);
//     setTimeout(ready, chance.integer({ min: 5000, max: 10000 }));
//   }
//   ready();
// }

// function attackChance(payload, client) {
//   // Define the success chance threshold (e.g., 0.7 for a 70% success chance)
//   const successChance = 0.6;

//   // Generate a random number between 0 and 1
//   const randomValue = Math.random();

//   if (randomValue <= successChance) {
//     // Attack is successful
//     let results = payload.health - payload.damage;
//     console.log(
//       'Users attack has hit successfully',
//       payload.countryId,
//       '-',
//       'Damage:',
//       payload.damage,
//       '-',
//       'Health Remaining:',
//       results
//     );
//     client.emit(EventNames.delivered, payload);
//     client.emit(EventNames.ready);
//   } else {
//     // Attack is unsuccessful
//     console.log("User's attack has missed", payload.countryId);
//     client.emit(EventNames.attackFailed, payload);
//     client.emit(EventNames.ready);
//   }
// }

// function handleSentAttack(payload, client) {
//   console.log('Waiting on enemy response');
//   setTimeout(
//     () => attackChance(payload, client),
//     chance.integer({ min: 5000, max: 10000 })
//   );
// }

// function startUser(client) {
//   console.log(`User ${client.id} has Entered Game`);
//   client.emit(EventNames.ready);
//   client.on(EventNames.chatMessage, (message) => {
//     client.emit(EventNames.chatMessage, message);
//   });
//   client.on(EventNames.chatMessage, (message) => {
//     console.log(`User ${client.id} send a message: ${message.message}`);
//   });
//   client.on(EventNames.gameStart, (payload) =>
//     handleSentAttack(payload, client)
//   );
//   attackStarting(client);
// }

// module.exports = {
//   attackStarting,
//   startUser,
// };
