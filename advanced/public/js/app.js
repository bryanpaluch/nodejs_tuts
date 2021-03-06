require.config({
  baseUrl: '/js/libs',
  paths: {app : '/js/app',
         models: '/js/models',
         views: '/js/views'},
  shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ["underscore", "jquery"],
      exports: "Backbone"
    },
    "jade-runtime" :{
      exports: "jade"
    },
    "/templates/jadeTemplates.js":{
      exports: "Templates"
    },
    "toastr" :{
      exports: "toastr"
    }
  }
});

require(["app/dispatcher"], function(dispatcher){
  dispatcher.init(); 
});

