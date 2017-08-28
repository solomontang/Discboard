const Discord = require('discord.js');
const config = require('../config.json')
const client = new Discord.Client();

client.on('ready', () => {
  console.log('I am ready!');
  // console.log(client);
});

client.on('message', message => {
  console.log(message);
  if (message.content === 'ping') {
    message.reply('pong');
  }
});

console.log(client.login(config.token));