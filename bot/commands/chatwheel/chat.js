const { Command } = require('discord.js-commando');
const fs = require('fs');
const { stripIndent } = require('common-tags');

module.exports = class ChatWheelCommand extends Command {
  constructor(client) {
    super(client, {
      prefix: 'what is happening',
      name: 'chatwheel',
      aliases: ['chat', 'c'],
      group: 'chatwheel',
      memberName: 'chatwheel',
      description: 'Plays ChatWheel soundboard clips.',
      details: 'Invoke Dota 2 chat wheel sound bites in the voice channel the bot is currently in. You must also be in the same voice channel.',
      examples: ['chatwheel waow',
                 'chat alldead',
                 'c disastah',
                 'c 5'],
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
    this.validParams = fs.readdirSync('./static/').map( name => {
      return name.slice(0, name.lastIndexOf('.'));
    });
  }

  async run(msg, args) {
    if (args.params === 'help') {
      return this.replyHelp(msg);
    } else {
      return msg.reply('gonna play the clip!');
    }
  }

  replyHelp(msg) {
    const {name, prefix} = this;
    return msg.embed({
      title: 'Command: ' + prefix + name,
      description: this.helpDescription(),
      color:16394280 
    });
  }

  helpDescription() {
    const {name, aliases, prefix, description, details, examples, validParams} = this;
    return stripIndent`
    **Aliases**: ${aliases.join(', ')}
    **Description**: ${description}
    **Details**: ${details}
    **Usage**: ${prefix}${name} [*name*]
    **Available Parameters**: ${validParams.join(', ')}
    `;
  }
}
