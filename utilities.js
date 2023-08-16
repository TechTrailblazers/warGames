const chance = require('chance')();

const EventNames = {
  pickup: 'pickUp',
  delivered: ' packDelivered',
  ready: 'ready',
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
