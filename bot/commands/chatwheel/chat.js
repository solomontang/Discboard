const { Command } = require('discord.js-commando');
const fs = require('fs');
const { stripIndent } = require('common-tags');
const path = require('path');
const axios = require('axios');
const spawn = require('child_process').spawn;
const prism = require('prism-media');

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
    this.validParams = fs.readdirSync(path.resolve(__dirname, '../../../static')).map( name => {
      return name.slice(0, name.lastIndexOf('.'));
    });
    console.log(this.validParams);
    this.currentVoiceConnection = null;
  }

  async run(msg, args) {

    if (msg.member.voiceChannel) {
      if (args.params === 'help') {
        return this.replyHelp(msg);
      } else if (args.params === 'join') {
        this.currentVoiceConnection = await msg.member.voiceChannel.join();
      } else if (args.params === 'leave' && this.currentVoiceConnection) {
        this.currentVoiceConnection = this.currentVoiceConnection.disconnect();
      } else {
        if (this.currentVoiceConnection) {
          if (this.currentVoiceConnection.channel.id === msg.member.voiceChannel.id) {
            let clipPath = path.resolve('static', args.params + '.wav')
            console.log(clipPath);
            // const dispatch = this.currentVoiceConnection.playFile( clipPath, {volume: 0.2} );
            let clipPromise = axios({
              method:'get',
              url:'https://d1u5p3l4wpay3k.cloudfront.net/dota2_gamepedia/c/c9/Chatwheel_rimshot.wav',
              responseType:'stream'
            });
            const clip = await Promise.resolve(clipPromise);

            // save clip to disk
            // clip.data.pipe(fs.createWriteStream('test.wav'));
            const transcoder = new prism.FFmpeg({
              args: [
                '-analyzeduration', '0',
                '-loglevel', '0',
                '-f', 's16le',
                '-ar', '48000',
                '-ac', '2',
              ],
            });
            const dispatch = this.currentVoiceConnection.playConvertedStream(clip.data.pipe(transcoder));
            // const broadcast = this.client.createVoiceBroadcast().playConvertedStream(clip.data);
            // /*const dispatch = */this.currentVoiceConnection.playConvertedStream(clip.data);
            //delete msg upon dispatch
            dispatch.on('start', () => {
              msg.delete();
            });
          } else {
            msg.reply(`Join the [${this.currentVoiceConnection.channel.name}] voice channel if you want to use the ChatWheel`);
          }
        }
      }
    } else {
      msg.reply('You must join a voice channel first!');
    }
    return;
  }

  async replyHelp(msg) {
    const {name, prefix} = this;
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
