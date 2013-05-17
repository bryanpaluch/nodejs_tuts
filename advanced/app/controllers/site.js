/**
 * Module dependencies.
 */
var passport = require('passport')
  , login = require('connect-ensure-login')

exports.user = function(req, res){
  if(req.result){
    res.render('site/user', {
      title: req.result.user.name,
      user: req.result.user,
      conference: req.result.conference,
      updated: req.result.message
    });
  }else{
    //support functions that don't pass req.result TODO make all pass req.results
    user = req.profile;   
    res.render('site/user', {
            title: user.name,
            user: user,
            conference: false,
            updated: false
      });
  }
}
exports.dashboard = function(req, res){
  if(req.result){
    console.log(req.result);
    res.render('site/dashboard', {
      conference: req.result.conference ,
      conferenceData: req.result.conferenceData
    });
  }
};
exports.index = function(req, res) {
  res.send('OAuth Server');
};
exports.jsonResponse = function( req, res){
  res.json(req.jsonResponse);
}
exports.loginForm = function(req, res) {
  console.log('login form');
  res.render('users/login');
};

exports.login = passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/login' });

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
}

exports.account = [
  login.ensureLoggedIn(),
  function(req, res) {
    res.render('users/show', { user: req.user });
  }
]
