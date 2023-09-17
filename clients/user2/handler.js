const { chance, EventNames } = require('../../utilities');

const inquirer = require('inquirer');
const { io } = require('socket.io-client');

const client = io('ws://localhost:3000');

let numberOfPlayers = 1;
let isWaitingForUserInput = true;
let startGameAnswers;

function setNumberOfPlayers(players) {
  numberOfPlayers = players;
  console.log(`Number of players set to: ${numberOfPlayers}`);
}

async function login() {
  console.log(`
    ░██╗░░░░░░░██╗███████╗██╗░░░░░░█████╗░░█████╗░███╗░░░███╗███████╗  ████████╗░█████╗░  ░██╗░░░░░░░██╗░█████╗░██████╗░
    ░██║░░██╗░░██║██╔════╝██║░░░░░██╔══██╗██╔══██╗████╗░████║██╔════╝  ╚══██╔══╝██╔══██╗  ░██║░░██╗░░██║██╔══██╗██╔══██╗
    ░╚██╗████╗██╔╝█████╗░░██║░░░░░██║░░╚═╝██║░░██║██╔████╔██║█████╗░░  ░░░██║░░░██║░░██║  ░╚██╗████╗██╔╝███████║██████╔╝
    ░░████╔═████║░██╔══╝░░██║░░░░░██║░░██╗██║░░██║██║╚██╔╝██║██╔══╝░░  ░░░██║░░░██║░░██║  ░░████╔═████║░██╔══██║██╔══██╗
    ░░╚██╔╝░╚██╔╝░███████╗███████╗╚█████╔╝╚█████╔╝██║░╚═╝░██║███████╗  ░░░██║░░░╚█████╔╝  ░░╚██╔╝░╚██╔╝░██║░░██║██║░░██║
    ░░░╚═╝░░░╚═╝░░╚══════╝╚══════╝░╚════╝░░╚════╝░╚═╝░░░░░╚═╝╚══════╝  ░░░╚═╝░░░░╚════╝░  ░░░╚═╝░░░╚═╝░░╚═╝░░╚═╝╚═╝░░╚═╝

    ░██████╗░░█████╗░███╗░░░███╗███████╗░██████╗
    ██╔════╝░██╔══██╗████╗░████║██╔════╝██╔════╝
    ██║░░██╗░███████║██╔████╔██║█████╗░░╚█████╗░
    ██║░░╚██╗██╔══██║██║╚██╔╝██║██╔══╝░░░╚═══██╗
    ╚██████╔╝██║░░██║██║░╚═╝░██║███████╗██████╔╝
    ░╚═════╝░╚═╝░░╚═╝╚═╝░░░░░╚═╝╚══════╝╚═════╝░
        `);

  // Prompt for game start and chat messaging
  try {
    // Ask if the user wants to start the game and enable chat messaging
    const startGameAnswers = await inquirer.prompt([
      {
        type: 'list',
        name: 'startGame',
        message: 'Do you want to start the game?',
        choices: ['Yes', 'No'],
      },
      {
        type: 'confirm',
        name: 'enableChat',
        message: 'Do you want to enable chat messaging?',
        default: false,
      },
    ]);

    if (startGameAnswers.startGame === 'Yes') {
      // Ask how many players the user wants to play with
      const numPlayersAnswers = await inquirer.prompt([
        {
          type: 'list',
          name: 'numPlayers',
          message: 'How many players do you want to play with? (1 or 2)',
          choices: ['1', '2'],
        },
      ]);

      const numPlayers = parseInt(numPlayersAnswers.numPlayers);

      if (numPlayers === 1) {
        console.log('You selected 1 player game.');
      } else {
        console.log('You selected 2 player game.');
      }

      // Continue with login logic
      const loginAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'username',
          message: 'Enter your username:',
        },
        {
          type: 'password',
          name: 'password',
          message: 'Enter your password:',
          mask: '*',
        },
      ]);

      const username = loginAnswers.username;
      const password = loginAnswers.password;

      console.log(`Logged in as ${username}`);

      startPlayer2(client, username);
      // Check if chat messaging is enabled and start chat messaging
      if (startGameAnswers.enableChat) {
        // Start the chat messaging system
        startChatMessaging(client);
      }

      const player1Attack = simulatePlayer1Attack();

      // Handle Player 1's attack and generate a response
      const response = handlePlayer1Attack(player1Attack);

      // Log the response
      console.log(`Player 1's attack response: ${response}`);

      // Continue with the rest of the code, including attack logic
      const attackAnswers = await inquirer.prompt([
        {
          type: 'list',
          name: 'choices',
          message: 'Do you want to attack?',
          choices: ['Yes', 'No'],
        },
      ]);

      if (attackAnswers.choices === 'Yes') {
        const attackCoordinatesAnswers = await inquirer.prompt([
          {
            type: 'list',
            name: 'coordinates',
            message: 'Select your attacking coordinates:',
            choices: ['Coordinates 1', 'Coordinates 2', 'Coordinates 3'],
          },
        ]);

        const attackCoordinates = attackCoordinatesAnswers.coordinates;
        console.log('Attacking on coordinates: ' + attackCoordinates);
        // Further processing related to coordinates
      } else {
        console.log('Goodbye');
      }
    } else {
      console.log('Goodbye');
      throw new Error('Game ended');
    }
  } catch (error) {
    if (error.message !== 'Game ended') {
      console.error('An error occurred:', error);
    }
  }
}

function simulatePlayer1Attack() {
  // Generate a simulated attack or fetch it from a real source
  return 'Simulated Attack Data'; // Replace with actual data
}

// Handle Player 1's attack and generate a response (replace with your logic)
function handlePlayer1Attack(player1Attack) {
  // Process the attack and generate a response
  // Replace with your logic to handle the attack
  const response = 'Attack Response'; // Replace with actual response
  return response;
}

async function startChatMessaging(client) {
  while (true) {
    const messageAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: 'Enter your message (or type "exit" to quit chat):',
      },
    ]);

    const message = messageAnswers.message;

    if (message.toLowerCase() === 'exit') {
      // Exit the chat messaging system
      break;
    }

    // Send the message to the server or other players
    client.emit(EventNames.chatMessage, message);

    console.log(`You sent a message: ${message}`);
  }
}

function startPlayer2(client, username) {
  console.log(`${username} has entered the game.`);
  client.emit(EventNames.ready);

  // Add event listeners for game events, attacks, etc.
  client.on(EventNames.gameStart, (payload) => {
    console.log(`Received attack from Player ${payload.player}`);
    // Handle the attack and respond accordingly
    handleReceivedAttack(payload, client);
  });

  client.on(EventNames.chatMessage, (message) => {
    console.log(`Received message: ${message}`);
    // You can display the received message in your chat interface
  });

  // Add more event listeners as needed

  // Continue with Player 2's game logic here
}

function handleReceivedAttack(payload, client) {
  // Handle the received attack here, calculate damage, etc.
  // Respond with attack results to Player 1 or the game logic

  // For example, you can simulate Player 2's response
  const responsePayload = {
    player: 2, // Player 2's response
    success: true, // Indicate whether the attack was successful
    health: 8000, // Adjust the health as needed
    damage: 2000, // Adjust the damage as needed
    countryId: payload.clientId, // Respond to the same player
  };

  console.log(`Player ${responsePayload.player} is responding to the attack.`);

  // Emit the response back to Player 1 or the game logic
  client.emit(EventNames.attackResponse, responsePayload);
}

// Call the login function to start Player 2's login and game setup

module.exports = {
  login,
  startChatMessaging,
};
