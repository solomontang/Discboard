const path = require('path');

module.exports = function ChatWheel(message, currentVoiceConnection, args) {
  if (!message.guild) return;

  // Only try to join the sender's voice channel if they are in one themselves
  if (message.member.voiceChannel) {
    if (args[0] === 'join') {
      currentVoiceConnection = message.member.voiceChannel.join();
    } else if (args[0] === 'leave' && currentVoiceConnection ) {
      currentVoiceConnection.then(connection => {
        connection.disconnect();
      });
    } else if (!!currentVoiceConnection) {
      currentVoiceConnection.then(connection => { // Connection is an instance of VoiceConnection
        //LOCAL FILES
        //Check if bot and member are in the same voiceChannel
        if (connection.channel.id === message.member.voiceChannel.id) {
          const dispatch = connection.playFile( path.resolve('static', args[0] + '.wav'), {volume: 0.2} );
          dispatch.on('start', () => {
            message.delete();
          });
        } else {
          message.reply(`Join the [${connection.channel.name}] voice channel if you want to use the ChatWheel`);
        }
        
        //TODO: STREAM REMOTE HOSTED FILE TO PLAYSTREAM
      })
      .catch(console.log);
    }
  } else {
    message.reply('You need to join a voice channel first!');
  }
  return currentVoiceConnection;
}

