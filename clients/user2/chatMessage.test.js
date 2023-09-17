const inquirer = require('inquirer');
const { startChatMessaging } = require('./handler'); // Replace with the actual module path

// Mock user input using Jest's built-in functionality
jest.mock('inquirer');

// Your test cases go here
describe('startChatMessaging', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocked functions after each test
  });

  it('should send a message to the server when user enters a message', async () => {
    // Mock user input to simulate entering a message
    inquirer.prompt.mockResolvedValue({ message: 'Hello, World!' });

    // Create a mock client with an emit function
    const clientMock = {
      emit: jest.fn(),
    };

    // Call the function with the mock client
    await startChatMessaging(clientMock);

    // Assert that emit was called with the expected arguments
    expect(clientMock.emit).toHaveBeenCalledWith(
      'chatMessage',
      'Hello, World!'
    );
  });

  it('should exit when the user enters "exit"', async () => {
    // Mock user input to simulate entering "exit"
    inquirer.prompt.mockResolvedValue({ message: 'exit' });

    // Create a mock client with an emit function
    const clientMock = {
      emit: jest.fn(),
    };

    // Call the function with the mock client
    await startChatMessaging(clientMock);

    // Assert that emit was not called
    expect(clientMock.emit).not.toHaveBeenCalled();
  });
});
