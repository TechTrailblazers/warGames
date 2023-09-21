const inquirer = require('inquirer');
const { startChatMessaging } = require('./index'); // Replace with the actual module path

// Mock user input using Jest's built-in functionality
jest.mock('inquirer');

// Your test cases go here
describe('startChatMessaging', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocked functions after each test
  });

  it('should send a message to the server when user enters a message', async () => {
    // Mock user input to simulate entering a message
    inquirer.prompt
      .mockResolvedValueOnce({ message: 'Hello, World!' }) // First prompt
      .mockResolvedValueOnce({ message: 'exit' }); // Second prompt

    // Create a mock client with an emit function
    const clientMock = {
      emit: jest.fn(),
    };

    // Call the function with the mock client
    await startChatMessaging(clientMock);

    // Assert that emit was called with the expected arguments for the first prompt
    expect(clientMock.emit).toHaveBeenCalledWith(
      'chatMessage',
      'Hello, World!'
    );

    // Assert that emit was not called for the second prompt (exit)
    expect(clientMock.emit).not.toHaveBeenCalledWith('chatMessage', 'exit');
  });
});
