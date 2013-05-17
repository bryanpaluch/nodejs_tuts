var redis = require('./redis_helper');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var uuid = require('node-uuid');
var _ = require('underscore');

function ConferenceBus(){
  var self = this;
  this.requestTimers = {};
  this.subscriptions = {};
  this.publisher = redis.createClient();
  this.subscriber = redis.createClient();

  this.subscriber.on('message', function(channel, message){
    var event = JSON.parse(message);
    console.log('got a message from the bus', channel, message);
    if(event.requestId){
      console.log('clearing timeout');
      clearTimeout(self.requestTimers[event.requestId]);
    }
    //remove redis request/reply/event wrapper and emit
    if(event.body){
      if(event.body.requester){ 
        self.emit('conferenceEvent', event.body.requester, event.body);
      }else{
        self.emit('conferenceEvent', channel, event.body);
      }
    }
  });
  this.catalog = {
    click2CallIn : {user: ['user', 'admin'],
                    fn: this.click2CallIn
                    }
  }
}

util.inherits(ConferenceBus, EventEmitter);
ConferenceBus.prototype.checkCatalog = function(requestType, userRights, cb){
  //check if the request type is in the catalog 
  if(this.catalog[requestType]){
    console.log('found the request type in the catalog');
    if(_.contains(this.catalog[requestType].user,userRights)){
      console.log('user has the correct rights');
      console.log(this.catalog[requestType]);
      cb(this.catalog[requestType].fn, this);
    }
    else{
      console.log('user doesnt have the correct rights');
      //no user rights return null
      cb(null);
    }
  }
  else{
    console.log('request type not found in catalog');
    //returns a null function that will be tested on the client
    cb(null);
  }
}

ConferenceBus.prototype.click2CallIn = function(msg, requester){
  var self = this; 
  console.log(msg);
  var request = {conferenceId: msg.conferenceId, type: 'request', request: 'click2CallIn', 
                userCallerIdName: msg.userCallerIdName, userCallerIdNumber: msg.userCallerIdNumber,
                requestId: uuid.v1(), requester: requester};
  this.getConferenceServer(msg.conferenceId, function(server){
    if(server){
      self.sendRequest(server, request, function(){
                      console.log('no reponse to click2callIn request')}); 
    } 
    else
      console.log('Conference doesnt exist TODO click2CallInWaitingRoom');
  });
}

ConferenceBus.prototype.conferenceEmpty= function(conferenceId, requester){
  this.emit('conferenceEvent', requester, {conferenceId: conferenceId, 
            messageType: 'getConferenceState', body:{ state: 'waiting'}});
}
ConferenceBus.prototype.getConferenceServer = function(conferenceId, cb){
  var self = this;
  this.publisher.get(conferenceId, function(err, data){
    console.log('got conference server ' + conferenceId + ' :' + data);
    if(data)
      cb(data);
    else
      cb(null);
  });
}
ConferenceBus.prototype.sendRequest = function(channel, request, errcb){
  console.log('sendRequest' + JSON.stringify(request)+ ' ' + channel);
  this.publisher.publish(channel, JSON.stringify(request), function(){});
  //pass error callback if you want a 3 second timeout for the request otherwise timeout is never set
  if(errcb != null)
    this.requestTimers[request.requestId] = setTimeout(errcb, 10000);
}
ConferenceBus.prototype.subscribe = function(conferenceId){
  if(this.subscriptions[conferenceId]){
    this.subscriptions[conferenceId]++;
  }else{
    console.log('creating redis subscription for ' + conferenceId);
    this.subscriptions[conferenceId] = 1;
    this.subscriber.subscribe(conferenceId);
  }
}
//Creates a message for getting conference state from the bus, and also
//has a fall back method in case the bus doesn't respond
//The response only goes back to one of the connected sockets.
ConferenceBus.prototype.getConferenceState = function(conferenceId, requester){
  var self = this; 
  var request = {conferenceId: conferenceId, type: 'request', request: 'getConferenceState', 
                requestId: uuid.v1(), requester: requester};
  this.getConferenceServer(conferenceId, function(server){
    if(server){
      self.sendRequest(server, request, function(){
                      self.conferenceEmpty(conferenceId, requester)}); 
    } 
    else
      self.conferenceEmpty(conferenceId, requester);
  });
}
ConferenceBus.prototype.conferenceEmpty= function(conferenceId, requester){
  this.emit('conferenceEvent', requester, {conferenceId: conferenceId, messageType: 'getConferenceState', body:{ state: 'waiting'}});
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

