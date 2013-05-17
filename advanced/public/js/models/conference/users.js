define([
  'backbone',
  'models/conference/user'
], function(BackBone, User){
  var ConferenceUsers = Backbone.Collection.extend({
    model: User,
    removeById: function(id){
    var user = this.get(id);
    this.remove(id);
    user.trigger('destroy');
    }
  });
  return ConferenceUsers;
});
