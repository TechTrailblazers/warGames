const chance = require('chance')();

const EventNames = {
  // pickup: 'pickUp',
  gameStart: 'gameStart',
  question1: 'question1',
  question2: 'question2',
  question3: 'question3',
  question4: 'question4',
  finalResult: 'finalResult',

  // pickedUp: 'driverPickedUp',
  // inTransit: 'inTransit',
  // announcement: 'announcement',
};

class Queue {
  constructor() {
    this.queue = [];
  }
  enqueue(item) {
    this.queue.unshift(item);
  }
  dequeue() {
    return this.queue.pop();
  }
  isEmpty() {
    return this.queue.length === 0;
  }
}
module.exports = { chance, EventNames, Queue };
