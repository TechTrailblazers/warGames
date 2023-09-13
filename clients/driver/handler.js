const { chance, EventNames } = require('../../utilities');

function deliver(payload, client) {
  console.log('Users attack has hit successfully', payload.messageId);
  client.emit(EventNames.delivered, payload);
  client.emit(EventNames.ready);
}

function handleGameStart(payload, client) {
  console.log('User has sent attack!', payload.messageId);
  setTimeout(
    () => deliver(payload, client),
    chance.integer({ min: 5000, max: 10000 })
  );
}

// function startDriver(client) {
//   console.log('User has Started Game');
//   client.emit(EventNames.ready);
//   client.on(EventNames.gameStart, (payload) =>
//     handleGameStart(payload, client)
//   );
// }

async function startDriver(client) {
  console.log('User has Started Game');
  client.emit(EventNames.ready);

  try {
    const inquirer = await import('inquirer');

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'startGame',
        message: 'Do you want to start the game?',
        choices: ['yes', 'no'],
      },
    ]);

    if (answer.startGame === 'yes') {
      console.log('Starting the game...');
      client.on(EventNames.gameStart, (payload) =>
        handleGameStart(payload, client)
      );
    } else {
      console.log('Game not started.');
    }
  } catch (error) {
    console.error('An error occurred while prompting the user:', error);
  }
  startDriver(client);
}

module.exports = { startDriver, toTest: { deliver, handleGameStart } };
