const vendorHandler = require('./handler');
const eventPool = require('../eventPool');
const { afterEach } = require('node:test');

jest.mock('../eventPool');

const simulateEvent = (eventName, payload) => {
  eventPool.emit(eventName, payload);
};

describe('Vendor Client Application Tests', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Simulate pickup event for vendor and check if it emits the event', () => {
    const storeName = 'Walmart';
    const mockPayload = {
      store: storeName,
      orderId: expect.any(String),
      customer: expect.any(String),
      address: expect.any(String),
    };

    vendorHandler.pickupEvent(storeName);
    expect(eventPool.emit).toHaveBeenCalledWith('pickup', mockPayload);
  });
  // test('Respond to delivered event with a thank you message', () => {
  //   const mockPayload = {
  //     store: 'test-store',
  //     orderId: 'test-order-id',
  //     customer: 'test-customer',
  //     address: 'test-address',
  //   };

  //   vendorHandler.pickupEvent(mockPayload.store);
  //   simulateEvent('delivered', mockPayload);

  //   expect(console.log).toBe(
  //     `VENDOR: Thank you for delivering ${mockPayload.orderId}`
  //   );
  // });
});
