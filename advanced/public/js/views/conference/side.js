define([
  'jquery',
  'underscore',
  'backbone',
  'views/user/side',
], function($, _, Backbone, UserView){
  var ConferenceSideView = Backbone.View.extend({
    el: $('#dashboard-menu'),
    events: {

    },
    initialize: function(){
      var self = this;
      console.log(self);
      this.collection.bind('add', function(model){
        self.addUser(model);
      });
    },
    addUser: function(id){
          var user = this.collection.get(id);
          var view = new UserView({model: user});
          this.$el.append(view.render().el);
          console.log(user);
    },
  });
  return ConferenceSideView;
});
