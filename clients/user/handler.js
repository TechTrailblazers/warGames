const { chance, EventNames } = require('../../utilities');

function deliver(payload, client) {
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

function handleGameStart(payload, client) {
  console.log(
    'User has sent attack!',
    payload.clientId,
    'is attacking',
    payload.countryId
  );
  setTimeout(
    () => deliver(payload, client),
    chance.integer({ min: 5000, max: 10000 })
  );
}

function startDriver(client) {
  console.log('User has Started Game');
  client.emit(EventNames.ready);
  client.on(EventNames.gameStart, (payload) =>
    handleGameStart(payload, client)
  );
}

// async function startDriver(client) {
//   console.log('User has Started Game');
//   client.emit(EventNames.ready);

//   try {
//     const inquirer = await import('inquirer');

//     const answer = await inquirer.prompt([
//       {
//         type: 'list',
//         name: 'startGame',
//         message: 'Do you want to start the game?',
//         choices: ['yes', 'no'],
//       },
//     ]);

//     if (answer.startGame === 'yes') {
//       console.log('Starting the game...');
//       client.on(EventNames.gameStart, (payload) =>
//         handleGameStart(payload, client)
//       );
//     } else {
//       console.log('Game not started.');
//     }
//   } catch (error) {
//     console.error('An error occurred while prompting the user:', error);
//   }
//   startDriver(client);
// }

module.exports = {
  startDriver,
  toTest: { deliver, handleGameStart },
};
