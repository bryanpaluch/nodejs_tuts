/**
 * Module dependencies.
 */
var app = require('express')()
  , server = require('http').createServer(app)
  , passport = require('passport')
  , rack = require('asset-rack')
  , fs = require('fs');
//Load Configs TODO  

var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];
console.log(config);
//bootstrap db TODO
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  mongoose.connect(config.db);


//bootstrap models TODO
var models_path = __dirname + '/app/models'
  , model_files = fs.readdirSync(models_path);
model_files.forEach(function(file) {
  require(models_path+'/'+file)
});

require('./config/auth').boot(passport,config);


var assets = new rack.AssetRack([
      new rack.JadeAsset({
        url: '/templates/jadeTemplates.js',
        dirname: __dirname + '/app/views/client',
        hash: false
      })
]);

assets.on('complete', function(){
  //bootstrap express settings
  require('./config/settings').boot(app, passport, assets);
  //bootstrap Interfaces
  require('./interfaces/routes')(app, passport);
  console.log(assets);
  var io = require('socket.io').listen(server)
  require('./libs/redis_helper.js').boot(config.memory);
  require('./interfaces/phoneConnector').EndPoint(app, {jsep2sipgw: config.jsep2sipgw});
  require('./interfaces/sockets')(io, passport);

  var port = process.env.PORT || 3003;
  server.listen(port);
});
