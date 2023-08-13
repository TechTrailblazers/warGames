// const { client } = require('ws://localhost:3000/caps');
const events = require('../../utilities');

const driverHandler = (payload, client) => {
  console.log('The package is ready to be picked up');
  setTimeout(() => {
    client.emit(events.inTransit, payload);
  }, 2000);
  setTimeout(() => {
    console.log('The package has been delivered');
    client.emit(events.delivered, payload);
  }, 5000);
};
module.exports = { driverHandler };
