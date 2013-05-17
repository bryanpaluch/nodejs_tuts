define([
  'underscore',
  'backbone',
  'models/conference/users',
  'models/conference/state',
  'views/conference/side',
  'views/conference/main',
  'app/connection',
  'views/conference/callinfo'
], function(_, BackBone, ConferenceUsers, ConferenceState, ConferenceSideView, ConferenceMainView, Connection, CallInfoView){
  var init = function(){
    var dispatcher = _.clone(Backbone.Events);
    var conferenceUsers = new ConferenceUsers();
    var conferenceSideView = new ConferenceSideView({collection : conferenceUsers});
    var conferenceState = new ConferenceState({status: 'waiting', message: 'Connecting to Server'});
    var conferenceMainView = new ConferenceMainView({model: conferenceState});
    var callInfoView = new CallInfoView({model: conferenceState});
    Connection.connect(dispatcher);
    dispatcher.on('connect', function(){
      conferenceState.set({message: 'Connected to Server, getting conference information'});
    });
    dispatcher.on('disconnect', function(){
      conferenceState.set({message: 'Disconnected from server, retrying to connect...'});
    });
    dispatcher.on('conferenceEvent', function(evt){
      console.log('got conference event'); 
      console.log(evt);
      if(EventParsers[evt.messageType] != null){
        console.log('got an event for that message type');
        EventParsers[evt.messageType](evt);
      }
    });
    dispatcher.on('userEvent', function(evt){
      console.log('dispatcher got request from user, deciding whether it can go over the socket connection');
      //TODO maybe put in some code in here to decide if its ok
      dispatcher.trigger('userRequest', evt);
    });
    //TODO figure out a way of not doing this.
    window.app = {}; 
    window.app.dispatcher = dispatcher;
    
    //end hack  
    
    var EventParsers = {
      'click2CallIn' : function(event){
        if(event.status === 'calling'){
          conferenceState.set({phonestate: 'c2c', c2cState: 'We have a placed a call to you'});
        }else if(event.status === 'failed'){
          conferenceState.set({phonestate: 'default'});
        }
      },
      'getConferenceState': function(event){
        if(event.state === 'waiting'){
          conferenceState.set({message: 'Conference hasn\'t started yet, waiting...', 
                              status: 'waiting'});
        }
        else if(event.state === 'started'){
          conferenceState.set({message: 'Conference started, display will start when leader opens it', 
                              status: 'started'});
          conferenceUsers.add(event.users); 
        }
      },
     'del-member': function(event){
          conferenceUsers.removeById(event.userConferenceId);
      },
     'add-member': function(event){
          if(conferenceState.get('status') === 'waiting'){
            conferenceState.set({message: 'Conference started, display will start when leader opens it', 
                                status: 'started'});
          }
          conferenceUsers.add(event);
      },
     'conference-destroy': function(event){
          if(conferenceState.get('status') !== 'waiting'){
            conferenceState.set({message: 'The conference has ended', 
                                status: 'waiting'});
          }
      },
     'conference-create': function(event){
          if(conferenceState.get('status') === 'waiting'){
            conferenceState.set({message: 'Conference started, display will start when leader opens it', 
                                status: 'started'});
          }
      },
    };
  }
  return {init: init};
});



