const { EventNames } = require('../../utilities');
const {
  toTest: { sendPickup, acknowledgedDelivery },
} = require('./handler.js');

describe('tests the vendor functions', () => {
  test('sendPickup should emit an order', () => {
    //arrange
    const io = { emit: jest.fn() };

    //act
    sendPickup(io);

    //assert
    expect(io.emit).toHaveBeenCalledWith(EventNames.pickup, expect.any(Object));
  }),
    test('should acknowledge delivery', () => {
      const clientMock = {
        emit: jest.fn(),
        // other properties and methods needed for the test
      };

      const payload = { messageId: 'test-message-id' };

      acknowledgedDelivery(payload, clientMock);

      expect(clientMock.emit).toHaveBeenCalledWith('received', payload);
    });
});
