var redis = require('redis');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var uuid = require('node-uuid');

var ip;

function boot(redisip){
  ip = redisip;
}

function createClient(opts){
  return redis.createClient(null, ip, opts);
}
function ConferenceBus(){
  var self = this;
  this.requestTimers = {};
  this.publisher = createClient();
  this.subscriber = createClient();
  this.subscriber.on('message', function(channel, message){
    var event = JSON.parse(message);
    console.log('got a message from the bus', channel, message);
    if(event.requestId){
      console.log('clearing timeout');
      clearTimeout(self.requestTimers[event.requestId]);
    }
    //remove redis request/reply/event wrapper and emit
    if(event.body)
      self.emit('conferenceEvent', channel, event.body);
  });
  this.subscriptions = {};
  console.log('attached to conference bus');
}

util.inherits(ConferenceBus, EventEmitter);

//User Requests get routed to the correct conference and the response gets
//unicasted back to the user
ConferenceBus.prototype.userRequest = function(request){
  var self = this;
  this.publisher.get(conferenceId, function(err, data){
    console.log('got response from bus ' + data);
    if(data)
      self.requestRooster(data, conferenceId);
    else
      console.log('No conference with that id on server currently');
  });
}

ConferenceBus.prototype.subscribe = function(conferenceId){
  if(this.subscriptions[conferenceId]){
    this.subscriptions[conferenceId]++;
  }else{
    console.log('creating redis subscription for ' + conferenceId);
    this.subscriptions[conferenceId] = 1;
    this.subscriber.subscribe(conferenceId);
  }
  this.checkForConference(conferenceId);
}
ConferenceBus.prototype.checkForConference= function(conferenceId){
  var self = this;
  this.publisher.get(conferenceId, function(err, data){
    console.log('got response from bus ' + data);
    if(data)
      self.requestRooster(data, conferenceId);
    else
      self.conferenceEmpty(conferenceId);
  });
}
ConferenceBus.prototype.conferenceEmpty= function(conferenceId){
  console.log('conference empty'); 
  this.emit('conferenceEvent', conferenceId, {conferenceId: conferenceId, messageType: 'getConferenceState', body:{ state: 'waiting'}});
}


ConferenceBus.prototype.requestRooster = function(channel, conferenceId){
  var self = this;
  var request = {conferenceId: conferenceId, type: 'request', request: 'getConferenceState', requestId: uuid.v1()};
  console.log('requesting Conference State');
  this.send(channel, request, function(){
           console.log('no response from redis bus api service may be down');
           self.conferenceEmpty(conferenceId);
  });
}
ConferenceBus.prototype.send = function(channel, request, errcb){
  console.log('sending request' + request);
  this.publisher.publish(channel, JSON.stringify(request), function(){});
  //pass error callback if you want a 3 second timeout for the request otherwise timeout is never set
  if(errcb != null)
    this.requestTimers[request.requestId] = setTimeout(errcb, 10000);
}
ConferenceBus.prototype.unsubscribe = function(conferenceId){
  if(this.subscriptions[conferenceId]){
    this.subscriptions[conferenceId]--;
    if(this.subscriptions[conferenceId] === 0){
      this.subscriptions[conferenceId] = null;
      this.subscriber.unsubscribe(conferenceId);
    }
  }
}
module.exports.ConferenceBus = ConferenceBus;
module.exports.boot = boot;
module.exports.createClient = createClient;

