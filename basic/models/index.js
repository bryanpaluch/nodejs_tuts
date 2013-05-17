var Sequelize = require('sequelize');

var sequelize = new Sequelize('test1', 'root', 'newmedia')

var models = [
  'User'
]

models.forEach(function(model) {
  module.exports[model] = sequelize.import(__dirname + '/' + model);
  //Uncomment the line below to drop tables and resync them
  //WARNING YOU LOSE DATA
  //DON"T PUT THIS IN PROD
  // module.exports[model].sync({force: true});
});

module.exports.sequelize = sequelize;
