define([
  'backbone'
], function(BackBone){
  var User = Backbone.Model.extend({
    defaults: {
      src: '/img/default.jpg',
      userCallerIdName: 'Unknown'
    },
    idAttribute: 'userConferenceId',
    initialize: function(){
      if(this.attributes.userCallerIdName === 'Outbound Call')
        this.attributes.userCallerIdName = 'Click2Call User';
    }
  });
  return User;
});
