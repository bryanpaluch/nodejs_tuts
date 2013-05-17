define([
  'jquery',
  'underscore',
  'backbone',
  'Templater',
  'spin'
], function($, _, Backbone, Templater, Spinner){
  var ConferenceMainView = Backbone.View.extend({
    el: $('#dashboard-main'),

    initialize: function(){
      var self = this
      console.log(self);
      this.spinner = new Spinner({zIndex: 1000, hwaccel: true}).spin($('#spinner-area')[0]);
      this.statusArea = $('#status-area');
      this.model.on('change', this.render, this);
      this.render(this.model);
    },
    render: function (state){
      view = this;
      if(state.attributes.status === 'waiting'){
        view.statusArea.html(state.attributes.message);
      }
      else if(state.attributes.status === 'started'){
        view.statusArea.html(state.attributes.message);
        view.spinner.stop();
      }
    },
  });
  return ConferenceMainView;
});
