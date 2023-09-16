const { EventNames } = require('../../utilities');
const {
  toTest: { attackChance, handleGameStart },
} = require('./handler.js');

// this test does not match the demo code, it is from my caps project, but you can use it as a reference
jest.useFakeTimers();

describe('Tests the driver handler functions', () => {
  test('Driver attackChance', () => {
    // Arrange
    const io = { emit: jest.fn() };

    // Act
    attackChance('1234', io);

    // Assert
    expect(io.emit).toHaveBeenCalledWith(EventNames.delivered, '1234');
  });

  test('Driver handleGameStart', () => {
    // Arrange
    const io = { emit: jest.fn() };

    // Act
    handleGameStart(
      {
        store: 'test',
        orderId: '1234',
        customer: 'customer',
        address: '111 Main',
      },
      io
    );

    // Timers - skip setTimeout
    jest.runAllTimers();

    // Assert
    expect(io.emit).toHaveBeenCalledWith(EventNames.delivered, '1234');
  });
});
