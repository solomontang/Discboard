const Discord = require('discord.js');
const config = require('../config.json')
const axios = require('axios');
const request = require('request');
const fs = require('fs');
const ytdl = require('ytdl-core');

const client = new Discord.Client();

const ChatWheel = require('./modules/ChatWheel');

var currentVoiceChannel;

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', message => {
  // console.log(message);
  if (message.content[0] !== config.prefix) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  console.log(`Command: ${command} \t Arguments: ${args}`);
  console.log('Message channel: ', message.channel.name, message.channel.id);
  if (command === 'ping') {
    message.reply('pong');
    return;
  } else if (command === 'c' || command === 'chat') {
    currentVoiceChannel = ChatWheel(message, currentVoiceChannel, command, args);
  } else {
    return;
  }
});

client.login(config.token);
