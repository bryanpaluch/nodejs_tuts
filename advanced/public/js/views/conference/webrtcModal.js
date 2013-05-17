define([
  'jquery',
  'underscore',
  'backbone',
  'views/user/side',
  'bootstrap.min',
  'views/conference/webrtc'
], function($, _, Backbone, UserView, bootstrap, WebRTCCallView){
  var WebrtcModalView = Backbone.View.extend({
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
      console.log(this);
      this.CallView = new WebRTCCallView(); 
      this.$el.modal('hide');
    } 
  });
  return WebrtcModalView;
});
