const eventPool = require('./eventPool');

eventPool.on('pickup', (payload) => {
  logEvent('pickup', payload);
});

eventPool.on('in-transit', (payload) => {
  logEvent('in-transit', payload);
});

eventPool.on('delivered', (payload) => {
  logEvent('delivered', payload);
});
// eventPool.onAny((event, payload) => {
//   logEvent(event, payload);
// });

function logEvent(event, payload) {
  const currentTime = new Date().toISOString();
  console.log(`EVENT: {
    event: '${event}',
    time: '${currentTime}',
    payload: ${JSON.stringify(payload, null, 2)}
  }`);
}
