const driverHandler = require('./handler');
const eventPool = require('../eventPool');

jest.mock('../eventPool');

// Helper function to simulate event emission
const simulateEvent = (eventName, payload) => {
  eventPool.emit(eventName, payload);
};

describe('Driver Client Application Tests', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(); // Mock console.log
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore original console.log after each test
  });

  test('Respond to pickup event by logging and emitting in-transit event', () => {
    const mockPayload = {
      store: 'test-store',
      orderId: 'test-order-id',
      customer: 'test-customer',
      address: 'test-address',
    };

    simulateEvent('pickup', mockPayload);

    expect(console.log).toHaveBeenCalledWith(
      expect.any(String) // Use expect.any() matcher to check the log message is present
    );
    expect(eventPool.emit).toHaveBeenCalledWith('in-transit', mockPayload);
  });

  test('Respond to in-transit event by logging and emitting delivered event', () => {
    const mockPayload = {
      store: 'test-store',
      orderId: 'test-order-id',
      customer: 'test-customer',
      address: 'test-address',
    };

    simulateEvent('in-transit', mockPayload);

    expect(console.log).toHaveBeenCalledWith(
      expect.any(String) // Use expect.any() matcher to check the log message is present
    );
    expect(eventPool.emit).toHaveBeenCalledWith('delivered', mockPayload);
  });
});
