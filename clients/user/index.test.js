const { startPlayer1 } = require('./index'); // Replace 'yourModule' with the actual module path

// Mock the required dependencies and functions
jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));
jest.mock('socket.io-client', () => ({
  io: jest.fn(),
}));

describe('startPlayer1 function', () => {
  let clientMock;
  let emitMock;
  let onMock;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock the client object and its methods
    emitMock = jest.fn();
    onMock = jest.fn();
    clientMock = {
      emit: emitMock,
      on: onMock,
    };
  });

  it('should emit the ready event with the correct username', () => {
    // Mock the inquirer prompt responses
    const inquirerPromptMock = jest
      .fn()
      .mockResolvedValueOnce({ username: 'user1' });
    require('inquirer').prompt = inquirerPromptMock;

    // Call the function
    startPlayer1(clientMock);

    // Check if the emit method was called with the correct arguments
    expect(emitMock).toHaveBeenCalledWith('ready', 'user1');
  });

  it('should set up event listeners for chat messages and readyToPlay', () => {
    // Call the function
    startPlayer1(clientMock);

    // Check if the on method was called with the correct events
    expect(onMock).toHaveBeenCalledWith('chatMessage', expect.any(Function));
    expect(onMock).toHaveBeenCalledWith('readyToPlay', expect.any(Function));
  });
});
