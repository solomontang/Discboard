const { Command } = require('discord.js-commando');
const { stripIndent, oneLine } = require('common-tags');
const axios = require('axios');
const { performance } = require('perf_hooks');
const { url } = require('../../../config.json');
const xml2js = require('xml2js');

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
  }

  async run(msg, args) {
    //TODO: this if chain is fucking gross. 
    let currentVoiceConnection = this.client.voiceConnections.get(msg.guild.id)
    let start = performance.now();
    if (msg.member.voiceChannel) {
      if (args.params === 'help') {
        return this.replyHelp(msg);
      } else if (args.params === 'join') {
        msg.member.voiceChannel.join(); //What is the impact of (not) having `await`
      } else if (args.params === 'leave') {
        currentVoiceConnection.disconnect();
      } else {
        if (currentVoiceConnection) {
          this.streamClip(msg, args.params, start)
        }
      }
    } else {
      msg.reply('You must join a voice channel first!');
    }
    return;
  }

  async streamClip(msg, param, start) {
    let clipPromise, dispatchTime, fetchTime, fetchStart;
    let currentVoiceConnection = this.client.voiceConnections.get(msg.guild.id);
    try {
      fetchStart = performance.now();
      clipPromise = await axios({
        method:'GET',
        url: url + '/transcoded/' + param + '.wav',
        responseType:'stream'
      });
    } catch(e) {
      if (e.response.status == 404) {
        msg.delete();
        msg.reply(param + ' is not an available parameter. Please refer to !c help')
      } else {
        msg.reply('something is fucked');
      }
    }
    fetchTime =  performance.now() - fetchStart;
    const dispatch = currentVoiceConnection.playConvertedStream(clipPromise.data);

    dispatch.on('start', () => {
      msg.delete();
      dispatchTime = Date.now();
    });

    // dispatch.on('end', async () => {
    //   const pingMsg = await msg.reply('Pinging...');
		// 	return pingMsg.edit(oneLine`
		// 		${msg.channel.type !== 'dm' ? `${msg.author},` : ''}
		// 		Pong! The message round-trip took ${dispatchTime - msg.createdTimestamp}ms.
		// 		The clip fetch time was ${fetchTime}ms.
		// 	`);
    // })
  }

  async replyHelp(msg) {
    const {name, prefix} = this;
    let XMLParser = new xml2js.Parser();
    axios.get(url).then(res => {
      XMLParser.parseString(res.data, (err, result) => {
        console.log(result.ListBucketResult);
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
