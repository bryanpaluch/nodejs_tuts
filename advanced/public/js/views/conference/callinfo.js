define([
  'jquery',
  'underscore',
  'backbone',
  'views/user/side',
  'bootstrap.min',
  'views/conference/webrtcModal',
  'views/conference/c2cModal',
  'Templater'
], function($, _, Backbone, UserView, bootstrap, WebrtcModal, C2CModal, Templater){
  var ConferenceCallInfoView = Backbone.View.extend({
    el: $('#dashboard-phone'),
    events: {
      "click .webrtc" : "showWebRTCModal",
      "click .c2c" : "showc2cModal",
    },
    initialize: function(){
      var self = this;
      this.dasharea = $("#dashboard-phone-status");
      this.model.on('change:phonestate change:webrtcState change:c2cState', this.render, this);
    },
    render: function(){
      this.dasharea.html(Templater['conference/dial']({conference: this.model.toJSON()}));
    }, 
    showWebRTCModal: function(id){
      if(this.webrtcModal){
        this.webrtcModal.show();
      }else{
        this.webrtcModal = new WebrtcModal({el: $('#connectwebrtc')});
      }
    },
    showc2cModal: function(id){
      if(this.c2cModal){
        this.c2cModal.show();
      }else{
        this.c2cModal = new C2CModal({el: $('#clicktocall')});
      }
    }
  });
  return ConferenceCallInfoView;
});
