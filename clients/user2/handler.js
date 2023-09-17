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

function login() {
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
  inquirer
    .prompt([
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
    ])
    .then((answers) => {
      startGameAnswers = answers; // Assign the answers to startGameAnswers

      if (startGameAnswers.startGame === 'Yes') {
        return inquirer.prompt([
          {
            type: 'list',
            name: 'numPlayers',
            message: 'How many players do you want to play with? (1 or 2)',
            choices: ['1', '2'],
          },
        ]);
      } else {
        console.log('Goodbye');
        // Handle the "No" choice here or exit the program
        return Promise.reject('Game not started');
      }
    })
    .then((numPlayersAnswers) => {
      // Handle the number of players here
      const numPlayers = parseInt(numPlayersAnswers.numPlayers);

      if (numPlayers === 1) {
        console.log('You selected 1 player game.');
      } else {
        console.log('You selected 2 player game.');
      }
    })
    .catch((error) => {
      if (error !== 'Game not started' && error !== 'Game ended') {
        console.error('An error occurred:', error);
      }
    })
    .then(() => {
      // Check if chat messaging is enabled
      if (startGameAnswers.enableChat) {
        // Start the chat messaging system
        startChatMessaging(client);
      }

      // Continue with login logic
      return inquirer.prompt([
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
    })
    .then((loginAnswers) => {
      // Handle login details here
      const username = loginAnswers.username;
      const password = loginAnswers.password;

      console.log(`Logged in as ${username}`);

      // Start Player 2's game logic here
      startPlayer2(client);
    })
    .catch((error) => {
      if (error !== 'Game not started' && error !== 'Game ended') {
        console.error('An error occurred:', error);
      }
    });
}

function startChatMessaging(client) {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'message',
        message: 'Enter your message (or type "exit" to quit chat):',
      },
    ])
    .then((messageAnswers) => {
      const message = messageAnswers.message;

      if (message.toLowerCase() === 'exit') {
        // Exit the chat messaging system
        return;
      }

      // Send the message to the server or other players
      client.emit(EventNames.chatMessage, message);

      // Continue receiving messages
      startChatMessaging(client);
    })
    .catch((error) => {
      console.error('An error occurred in chat messaging:', error);
    });
}

function startPlayer2(client) {
  console.log(`Player 2 (ID: ${client.id}) has entered the game.`);
  client.emit(EventNames.ready);

  // Add event listeners for game events, attacks, etc.
  client.on(EventNames.gameStart, (payload) => {
    console.log(`Received attack from Player ${payload.player}`);
    // Handle the attack and respond accordingly
    handleReceivedAttack(payload, client);
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
};
