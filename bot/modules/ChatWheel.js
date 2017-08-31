const path = require('path');

module.exports = function ChatWheel(message, currentVoiceChannel, command, args) {
  console.log('in chatwheel');
  console.log(args);
  if (!message.guild) return;
  // Only try to join the sender's voice channel if they are in one themselves
  if (message.member.voiceChannel) {
    if (args[0] === 'join') {
      currentVoiceChannel = message.member.voiceChannel.join();
    } else if (args[0] === 'leave' && currentVoiceChannel ) {
      currentVoiceChannel.then(connection => {
        connection.disconnect();
      });
    } else if (currentVoiceChannel) {
      currentVoiceChannel.then(connection => { // Connection is an instance of VoiceConnection
        //LOCAL FILES
        const dispatch = connection.playFile( path.resolve('static', args[0] + '.wav'), {volume: 0.3} );

        //TODO: STREAM REMOTE HOSTED FILE TO PLAYSTREAM

        // axios({
        //   method:'get',
        //   url:'https://dota2.gamepedia.com/media/dota2.gamepedia.com/b/bf/Chatwheel_frog.wav',
        //   responseType:'octet-stream'
        // })
        //   .then(function(response) {
        //     // console.log(response.data);
        //     connection.playStream(response.data);
        //   });

        //YOUTUBE STREAM
        // const stream = ytdl('https://www.youtube.com/watch?v=XAWgeLF9EVQ', { filter : 'audioonly' });
        // const dispatcher = connection.playStream(stream);
      })
      .catch(console.log);
    }
  } else {
    message.reply('You need to join a voice channel first!');
  }
  return currentVoiceChannel;
}

