define([
       'jquery',
       'underscore',
       'backbone',
       'models/webRTCSession',
       'Templater'
], function($, _, Backbone, WebRTCSession, Templater){
  var CallView = Backbone.View.extend({
    el: $('#webrtc-phone'),
    events: {
      "click .call" : 'startCall'
    },
    initialize: function(){
      var self= this;
      //this.$el.show();
      //set the dispatcher from global
      this.dispatcher = window.app.dispatcher;
      this.$el.show(); 
      this.startCall();
    },
    startCall: function(id){
      var self = this;
      var number = 'conference';
      this.model = new WebRTCSession({voiceOnly: true});
      // map the dispatcher inbound signaling for this webrtc session
      this.dispatcher.on('rtc_server_message', function(data){
                          self.model.onSignalingMessage(data)});
      // give the session a method for communicating to the server
      this.model.emitSignalingMessage = (function(data){
        self.dispatcher.trigger('rtc_client_message',data);}); 
      this.model.bind('change:state', function(model){
        self.renderState(model);
      }, this);
      //bind to the remoteStreamAdded event so you can render the video or audio
      this.model.bind('remoteStreamAdded', function(model){
        self.renderRemoteStream(model);
      }, this);
      this.model.bind('localStreamAdded', function(model){
        self.renderLocalStream(model);
      }, this);
      this.model.bind('remoteHangup', function(model){
        self.removeAudio();
      });
      //Wait for the model to be ready
      this.model.bind('ready', function(){ 
        console.log('session ready. calling');
        //if we were doing a video call we could use localStream to bind to a video
        //tag now, but this is a voice only call
        self.model.call({number:number});
      });
      //catch any webrtc related errors 
      this.model.bind('error', function(error){
        console.log('ERROR!!!! something went wrong with the webrtc session' + error);
      });
    },
    removeAudio: function(model){
      $("#audioholder").empty();
    },
    renderState: function(model){
      var self = this;
      var state = this.model.get('state');
      this.$el.animate({opacity:0},600, function(){
        self.$el.html(Templater['webrtc/status']({state: state}));
        self.$el.animate({opacity:1},300);
      });
    },
    renderRemoteStream: function(){
      var audioElement = document.createElement('audio');
      audioElement.setAttribute('autoplay', 'autoplay');
      $("#audioholder").append(audioElement);
      this.model.attachMediaStream(audioElement, this.model.get('remoteStream'));
      console.log('added remote stream');
      console.log(this.model.toJSON());
    },
    renderLocalStream: function(){
      var audioElement = document.createElement('audio');
      audioElement.setAttribute('autoplay', 'autoplay');
      $("#audioholder").append(audioElement);
      this.model.attachMediaStream(audioElement, this.model.get('localStream'));
      console.log('added local stream');
      console.log(this.model.toJSON());
    }
  });
  return CallView;
});
