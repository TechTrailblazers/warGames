const chance = require('chance')();

const EventNames = {
  gameStart: 'gameStart',
  ready: 'ready',
  delivered: 'delivered',
  finalResult: 'finalResult',
  received: 'received',
  attackFailed: 'attackFailed',
  disconnect: 'disconnect',
  chatMessage: 'chatMessage',
  readyToPlay: 'readyToPlay',
  chosenNumPlayers: 'chosenNumPlayers',
};

// class Queue {
//   constructor() {
//     this.queue = [];
//   }
//   enqueue(item) {
//     this.queue.unshift(item);
//   }
//   dequeue() {
//     return this.queue.pop();
//   }
//   isEmpty() {
//     return this.queue.length === 0;
//   }
// }
module.exports = { chance, EventNames };
