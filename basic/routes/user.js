var User = require('../models').User;
/*
 * GET users listing.
 */

exports.list = function(req, res){
  User.findAll()
  .success(function(users){
    console.log("Got all the users");
    res.render('list', {users: users});
  })
  .error(function(err){
    res.send(err);
  });
};

exports.form = function(req, res){
  res.render('create', { title: 'Express' });
};

exports.show= function(req, res){
  console.log(req.params.id);
  User.find(req.params.id)
  .success(function(user){
    console.log('found user!');
    res.render('show', {user: user});
  })
  .error(function(err){
    res.send(404, err);
  });;
};
exports.create= function(req, res){
  console.log(req.body);
  var user = User.build({name: req.body.name, 
                         email: req.body.email, 
                         pin: req.body.pin});
  //Note the promise styled chained callbacks 
  user.save()
  .success(function(data){
    console.log("user saved with id: " + data.id);
    //Render a show template, pass it the users saved data
    res.render('show', {user : data});
  })
  .error(function(error){
    console.log("Error", error);
    res.send(error); 
  });

};
exports.update= function(req, res){
  res.send("respond with a resource");
};
exports.remove= function(req, res){
  res.send("respond with a resource");
};
