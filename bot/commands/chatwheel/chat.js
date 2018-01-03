const { Command } = require('discord.js-commando');
const fs = require('fs');
const { stripIndent } = require('common-tags');
const path = require('path');
const axios = require('axios');
// const spawn = require('child_process').spawn;
const prism = require('prism-media');
const { performance } = require('perf_hooks');
const { url } = require('../../../config.json');
const xml2js = require('xml2js');


//TODO: Refactor to check if msg sender's current VoiceConnection is within Client.VoiceConnections
module.exports = class ChatWheelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'chatwheel',
      aliases: ['chat', 'c'],
      group: 'chatwheel',
      memberName: 'chatwheel',
      description: 'Plays ChatWheel soundboard clips.',
      details: 'Invoke Dota 2 chat wheel sound bites in the voice channel the bot is currently in. You must also be in the same voice channel.',
      args: [
        {
          key: 'params',
          label: 'clip',
          prompt: 'What sound clip would like you to play?',
          type: 'string',
          infinite: false
        },
      ],
      argsCount: 1,
      guildOnly: true,
      throttling: {
        usages: 5,
        duration: 30
      },
    });
    this.prefix = client.options.commandPrefix;
    // console.log(path.resolve(__dirname, '../../../static'));
    //Apparently this only works when PM2 is run from within Discboard folder?
    this.validParams = fs.readdirSync(path.resolve(__dirname, '../../../static')).map( name => {
      return name.slice(0, name.lastIndexOf('.'));
    });
    // console.log(this.validParams);
  }

  async run(msg, args) {
    //TODO: this if chain is fucking gross. find a way to make it less so
    let currentVoiceConnection = this.client.voiceConnections.get(msg.guild.id)
    let start = performance.now();
    if (msg.member.voiceChannel) {
      if (args.params === 'help') {
        return this.replyHelp(msg);
      } else if (args.params === 'channels') { //Check current voiceConnections
        console.log(currentVoiceConnection);
      } else if (args.params === 'join') {
        await msg.member.voiceChannel.join(); //What is the impact of (not) having `await`
      } else if (args.params === 'leave') {
        currentVoiceConnection.disconnect();
      } else {
          if (currentVoiceConnection) {
            try {
              let clipPromise = await axios({
                method:'GET',
                url: url + '/' + args.params + '.wav',
                responseType:'stream'
              });
              
              //Transcode file to 48000 sampling rate
              const transcoder = new prism.FFmpeg({
                args: [
                  '-analyzeduration', '0',
                  '-loglevel', '0',
                  '-f', 's16le',
                  '-ar', '48000',
                  '-ac', '2',
                ],
              });
  
              const dispatch = currentVoiceConnection.playConvertedStream(clipPromise.data.pipe(transcoder), {volume: 0.2});
  
              dispatch.on('start', () => {
                msg.delete();
                console.log(performance.now() - start);
              }); 
            } catch(e) {
              if (e.response.status == 404) {
                msg.delete();
                msg.reply(args.params + ' is not an available parameter. Please refer to !c help')
              } else {
                msg.reply('something is fucked');
              }
            }
          }
          // else {
          //   msg.reply(`Join the [${this.currentVoiceConnection.channel.name}] voice channel if you want to use the ChatWheel`);
          // }
      }
    } else {
      msg.reply('You must join a voice channel first!');
    }
    return;
  }

  async replyHelp(msg) {
    const {name, prefix} = this;
    let XMLParser = new xml2js.Parser();
    axios.get(url).then(res => {
      XMLParser.parseString(res.data, (err, result) => {
        console.log(result.ListBucketResult.Contents);
      })
    })
    return msg.embed({
      title: 'Command: ' + prefix + name,
      description: this.helpDescription(),
      color:16394280 
    });
  }

  helpDescription() {
    const {name, aliases, prefix, description, details, validParams} = this;
    return stripIndent`
    **Aliases**: ${aliases.join(', ')}
    **Description**: ${description}
    **Details**: ${details}
    **Usage**: ${prefix}${name} [*name*]
    **Available Parameters**: ${validParams.join(', ')}
    `;
  }
}
