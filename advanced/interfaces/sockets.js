var util = require('util');
var user = require('../app/controllers/user.js');
var conference = require('../app/controllers/conference.js');
var ConferenceBus = require('../libs/ConferenceBus.js').ConferenceBus;
var webrtcConnector = require("./phoneConnector");
var webrtc = webrtcConnector.createConnector();

module.exports = function(io, auth) {
  var cm = new ConferenceBus();
	io.set('log level', 5);
  cm.on('conferenceEvent', function(conferenceId, event){
    io.sockets.in(conferenceId).emit('conferenceEvent', event);
  });
	io.set('authorization', function(data, accept) {
		if (data.headers) {
          data.authorized = false;
          console.log(data.headers);
					return accept(null, true);
		} else {
			return accept('No cookie transmitted', false);
		}
	});

	io.sockets.on('connection', function(socket) {
      socket.legs = {};
      socket.on('disconnect', function() {
        if(socket.authorized){
          cm.unsubscribe(conference.conferenceId);
        }else{
          console.log('unauthorized socket disconnected');
        }
        for (var leg in socket.legs){
          console.log('disconnecting sending bye'); 
          webrtc.send({type: 'bye', from: socket.id});
        }
      });
      socket.on('auth', function(data){
        console.log(data.key);
        conf = conference.decryptKey(data);
        console.log(conf);
        socket.admin = conf.admin;
        console.log('authenticated');
        socket.authorized = true;
        socket.emit('authsuccess', {status: 'ok'});
        socket.join(conf.conferenceId);
        socket.join(socket.id);
        //We will use this for future reference
        socket.conferenceId = conf.conferenceId;
        cm.subscribe(conf.conferenceId);
        cm.getConferenceState(conf.conferenceId,socket.id);
        console.log('send a request to redis for conference stats');
      });
      socket.on('userRequest', function(data){
        if(socket.authorized){
          console.log('letting conference manager deal with it');
          //TODO for now, in future message could go to other service
          console.log(data);
          data.conferenceId = socket.conferenceId;
          cm.checkCatalog('click2CallIn', 'user', function(fn, self){
            fn.apply(self,[data, socket.id]);
          });
        }
      });
      socket.on('rtc_client_message', function(data){
        console.log('got rtc client message ' + JSON.stringify(data));
        var target = data.target;
        data.from = this.id;
        if(data.type == 'offer' || data.type == 'answer'){
          socket.legs[target] = true;
        }
        if(data.type == 'offer'){
          data.toTN = socket.conferenceId;
         // data.toTN = '2152868972';
          data.fromTN = '8605818926';
          webrtc.send(data);
        }else{
          webrtc.send(data);
        }
      });

	});
  webrtc.on('event', function(data){
    var target = data.target;
    io.sockets.socket(target).emit('rtc_server_message', data);
    console.log('sent to client' + target);
  });

}

