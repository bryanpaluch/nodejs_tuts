/**
 * Module dependencies.
 */
var mongoose = require('mongoose')
 , User = mongoose.model('User') 
 , login = require('connect-ensure-login');
  
module.exports = function(app, passport){


var site = require('../app/controllers/site');
var user = require('../app/controllers/user.js');
var admin = require('../app/controllers/admin.js');
var oauth = require('../app/controllers/oauth.js');
var conference = require('../app/controllers/conference.js');

app.get('/', user.about);
app.get('/login', site.loginForm);
app.post('/login', user.login);
app.get('/logout', site.logout);
app.get('/account', site.account);
app.get('/signup', user.signup);
app.post('/users', user.create);
app.post('/users/session', user.session);

//Oauth Access actions and pages
app.get('/dialog/authorize', oauth.userAuthorization);
app.post('/dialog/authorize/decision', oauth.userDecision);
app.post('/oauth/request_token', oauth.requestToken);
app.post('/oauth/access_token', oauth.accessToken);

//All browser website routes
app.all('/site/user/*', login.ensureLoggedIn());
app.get('/site/dashboard', login.ensureLoggedIn(), conference.getKey, site.dashboard);
app.get('/site/dashboard/:conferenceId', conference.getById, conference.getKey, site.dashboard);

app.post('/site/user/:userId/conference', conference.createOrUpdateConference, site.user);
app.get('/site/user/:userId', conference.get, site.user);

app.get('/users/:userId', site.user);

app.all('/api*', passport.authenticate('token', { session: false }));
app.get('/api/userinfo', user.info);


app.all('/admin*', login.ensureLoggedIn(), function(req, res, next){
      console.log('checking if user is admin');
      if(req.user.isAdmin)
        next();
      else
        res.render('admin/notAdmin');
});

app.get('/admin', admin.show);
app.post('/admin/email', admin.email);
app.get('/admin/all', admin.all);
app.get('/admin/user/:userId', admin.showuser);
app.post('/admin/user/:userId', admin.edituser);
app.param('userId', function(req, res, next, id){
  User.findOne({_id: id})
  .exec(function(err, user){
    if (err) return next(err);
    if (!user) return next(new Error('Failed to load User ' + id));
    req.profile = user;
    next();
  });
});


}
