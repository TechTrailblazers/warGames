const { chance, EventNames } = require('../../utilities');

function userInput(payload, client) {
  console.log('Country has been impacted', payload.messageId);
  client.emit(EventNames.deliveredAttack, payload);
  client.emit(EventNames.userReady);
}

function handleAttack(payload, client) {
  console.log('Country Attack has incoming attack', payload.messageId);
  setTimeout(
    () => userInput(payload, client),
    chance.integer({ min: 5000, max: 10000 })
  );
}

function startGame(client) {
  console.log("Let's go!");
  client.emit(EventNames.gameStart);
  client.on(EventNames.enemyResponse, (payload) =>
    handleAttack(payload, client)
  );
}

module.exports = { startGame, toTest: { userInput, handleAttack } };
