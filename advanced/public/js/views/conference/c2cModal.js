define([
  'jquery',
  'underscore',
  'backbone',
  'views/user/side',
  'bootstrap.min',
], function($, _, Backbone, UserView, bootstrap){
  var C2CModalView = Backbone.View.extend({
    events: {
      "click .close" : "hide",
      "click .submit" : "submit",
    },
    initialize: function(){
      var self = this;
      this.$el.modal('show');
    },
    show: function(){
      this.$el.modal('show');
    },
    hide: function(){
      console.log('hiding modal');
      console.log(this);
      this.unbind();
    },
    submit: function(){
      console.log('hit submit');
      var phoneNumber = $("#phoneNumber").val();
      var name = $("#name").val();
      if(phoneNumber && name){
        //TODO create a modal of request and send. for now just send over
        //dispatcher from global
        var request = {messageType: 'click2CallIn', userCallerIdNumber: phoneNumber, userCallerIdName: name};
        window.app.dispatcher.trigger('userEvent' , request); 
        console.log(phoneNumber + name);
      }
      this.$el.modal('hide');
    }
  });
  return C2CModalView;
});
