/**
 * Module dependencies.
 */
var passport = require('passport')
, mongoose = require('mongoose')
, crypto = require('crypto')
, User = mongoose.model('User')
exports.signup = function (req, res){
  res.render('users/signup', {
              title: 'Sign up'
              });
}
exports.create = function(req, res){
 console.log(req.body); 
  var user = new User(req.body);
  console.log(user);
  user.provider = 'local';
  user.save(function(err){
    if(err) {
      console.log(err);
      return res.render('users/signup', {
        error: err.errors
      });
    }
    console.log(this);
    req.logIn(user, function(err){
      if(err) return next(err);
      return res.redirect('/');
    });
  });
}

exports.session = function(req, res, next){
  passport.authenticate('local', function(err, user, info){
    if(err) { return next(err)}
    if(!user) {
        return res.redirect('/login');
    }else{
      req.logIn(user, function(err){
        if(err) {return next(err);}
          return res.redirect('/');
      });
    }})(req, res, next);
}
exports.about = function(req, res){
  console.log(req.session); 
  res.render('site/about');
}
exports.login = function(req, res) {
    res.render('users/login', {
          title: 'Login'
            });
}

exports.logout = function(req, res) {
    req.logout();
      res.redirect('/login');
}

exports.show = function(req, res) {
    var user = req.profile
      res.render('users/show', {
            title: user.name,
                user: user,
                    updated: false
      });
}
exports.signin = function(req, res) {}

exports.info = [
  function(req, res) {
    console.log(req.user);
    res.json({ user_id: req.user.id, name: req.user.name, phoneNumber: req.user.phoneNumber })
  }
]

