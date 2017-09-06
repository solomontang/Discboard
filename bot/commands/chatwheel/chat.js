const { Command } = require('discord.js-commando');
const fs = require('fs');
const { stripIndent } = require('common-tags');
const path = require('path');
// const axios = require('axios');

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
            console.log(path.resolve('static', args.params + '.wav'));
            const dispatch = this.currentVoiceConnection.playFile( path.resolve('static', args.params + '.wav'), {volume: 0.2} );
            // axios({
            //   method:'get',
            //   url:'https://dota2.gamepedia.com/media/dota2.gamepedia.com/b/bf/Chatwheel_frog.wav',
            //   responseType:'stream'
            // })
            //   .then(function(response) {
            //     // console.log(response.data);
            //     console.log('getting wav')
            //     // response.data.pipe(fs.createWriteStream('TESTING.wav'));
            //     connection.playStream(response.data);
            //   });
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
