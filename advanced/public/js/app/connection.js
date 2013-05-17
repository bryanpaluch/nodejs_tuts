define([
  '/socket.io/socket.io.js'
], function(io){

  var connect = function(dispatcher){
    $(document).ready(function () {
      var conferenceData = document.getElementById('conferenceData'); 
      var socket = io.connect('/');
      socket.on('connect', function(){
        dispatcher.trigger('connect');
        socket.emit('auth', JSON.parse(conferenceData.innerText));
      });
      socket.on('disconnect', function(){
        dispatcher.trigger('disconnect');
      });
      socket.on('conferenceEvent', function(evt){
        dispatcher.trigger('conferenceEvent', evt);
      });
      socket.on('rtc_server_message', function(data){
        dispatcher.trigger('rtc_server_message', data);
      });
      dispatcher.on('userRequest', function(evt){
        socket.emit('userRequest', evt);
      });
      dispatcher.on('rtc_client_message', function(data){
        socket.emit('rtc_client_message', data);
      });
    });
  };
  return { connect: connect};
});

