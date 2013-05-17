define([
  'jquery',
  'underscore',
  'backbone',
  'Templater',
  'toastr'
], function($, _, Backbone, Templater, toastr){
  toastr.options= {positionClass: 'toast-bottom-right'};
  var UserView = Backbone.View.extend({
    tagName: "li",
    event: {
    },
    initialize: function(){
      var user = this.model;
      toastr.info(user.attributes.userCallerIdName + " <" + user.attributes.userCallerIdNumber + "> has joined");
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },
    render: function(){
      this.$el.html(Templater['conference/user/menuitem'](this.model.toJSON()));
      return this;
    },
    remove: function(){
      var user = this.model;
      toastr.info(user.attributes.userCallerIdName + " <" + user.attributes.userCallerIdNumber + "> has left");
      $(this.el).remove();
    }
  });

  return UserView;
});

