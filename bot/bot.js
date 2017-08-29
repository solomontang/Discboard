const Discord = require('discord.js');
const config = require('../config.json')
const client = new Discord.Client();

client.on('ready', () => {
  console.log('I am ready!');
  // console.log(client);
});

client.on('message', message => {
  // console.log(message);
  if (message.content[0] !== config.prefix) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  console.log('arguments, command', args, command);
  console.log('message channel: ', message.channel.name, message.channel.id);
  switch (command) {
    case 'ping':
      message.reply('pong');
    default:
      return;
  }
});

console.log(client.login(config.token));