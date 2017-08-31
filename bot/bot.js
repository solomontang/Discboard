const Discord = require('discord.js');
const config = require('../config.json')
// const axios = require('axios');
// const request = require('request');
const fs = require('fs');
// const ytdl = require('ytdl-core');

const client = new Discord.Client();

const ChatWheel = require('./modules/ChatWheel');

var currentVoiceConnection = null;

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', message => {
  if (message.content[0] !== config.prefix) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === 'ping') {
    message.reply('pong');
  } else if (command === 'c' || command === 'chat') {
    currentVoiceConnection = ChatWheel(message, currentVoiceConnection, command, args);
  } else {
    return;
  }
});

client.login(config.token);
