/**
 * Module dependencies.
 */
var passport = require('passport')
, mongoose = require('mongoose')
, crypto = require('crypto')
, User = mongoose.model('User')
, Conference = mongoose.model('Conference')
, _ = require('underscore');
//Creates or updates a users conference entry then sends it to the next
//middleware object for rendering, or api json return
exports.createOrUpdateConference = function(req, res, next){
  Conference.findOne({user : req.profile._id})
    .exec(function(err, conf){
      if(err) return next(err)
      if(!conf){
        var conf = new Conference(req.body);
        conf.user = req.profile._id;
        console.log('no conference found');
        conf.save(function(err){
          if(err){
            console.log(err);
            return next(err);
          }
          console.log(this);
          req.result = {status: '200', message: 'Conference Added',
                      user: req.profile, conference: conf};
          return next();
        });
      }else{
        console.log('conference found updating');
        conf = _.extend(conf, req.body);
        conf.save(function(err, doc){
          if(err){
           return next(err);
          }
          req.result = {status: '200', message:' Conference Updated',
                     user: req.profile, conference: conf};
          return next();
        });
      }
    });
}
exports.get = function(req, res, next){
  Conference.findOne({user: req.profile._id})
    .exec(function(err, conf){
      if(err) return next(err)
      if(!conf){
        console.log('no conference found');
          req.result = {status: '200', message: false,
                      user: req.profile, conference: conf};
          return next();
      }else{
          console.log('conference found');
          req.result = {status: '200', message: false,
                     user: req.profile, conference: conf};
          return next();
      }
    });
}
exports.getById = function(req, res, next){
  if(req.param('conferenceId')){
    var conferenceId = req.param('conferenceId');
    console.log(conferenceId + "Getting conference");
    Conference.findOne({"conferenceId": conferenceId})
    .exec(function(err, conf){
      if(!conf)
        return next('Error no conference found');
      else{
        req.conference = conf;
        next();
      }
    });
  }else{
    return next('Error no conferenceId given');
  }
}

exports.getKey = function(req, res, next){
  req.result ={};
  if(req.user && !req.conference){
    Conference.findOne({user: req.user._id})
      .exec(function(err, conf){
        if(!conf){
          console.log('user has no conference error');
          return next('Error no conference ');
        }else{
          console.log('conference found');
          req.result.conference = conf;
          req.result.conference.pin = null;
          req.result.conference.admin = true;
          var time = new Date().getTime().toString();
          req.result.conferenceData = { key: signKey(req.result.conference, time), admin: true, time: time}
          next(); 
        }
      });
        //They went to the unique url/dashboard/confIdnumber instead of /dashboard but are logged in
  }
  else if(req.user && req.conference){
    if(req.conference.user === req.user._id){
          req.result.conference = conf;
          req.result.conference.pin = null;
          req.result.conference.admin = true;
          var time = new Date().getTime().toString();
          req.result.conferenceData = { key: signKey(req.result.conference, time), admin: true, time: time}
          next(); 
    }
    else{
          req.result.conference = conf;
          req.result.conference.pin = null;
          req.result.conference.admin = false;
          var time = new Date().getTime().toString();
          req.result.conferenceData = { key: signKey(req.result.conference, time), admin: false, time: time}
          next(); 
    }
  }
  else if(req.conference){
          req.result.conference = req.conference;
          req.result.conference.pin = null;
          req.result.conference.admin = false;
          var time = new Date().getTime().toString();
          req.result.conferenceData = { key: signKey(req.result.conference, time), admin: false, time: time}
          next(); 
  }
  else{
    next('No conference found');
  }
}

function signKey(conference, time){
  try{
    var cipher = crypto.createCipher("aes-256-cbc", "SecretPassword" + time);
    console.log(time);
    var signedKey = cipher.update(JSON.stringify(conference), 'utf8', 'base64');
    signedKey += cipher.final('base64');
    return signedKey;
  }catch(e){
    return null;
  }
}
var decryptKey =  exports.decryptKey = function (conferenceData, cb){
  try{ 
    console.log(conferenceData.time);
    var decipher = crypto.createDecipher("aes-256-cbc", "SecretPassword" + conferenceData.time);
    var conference  = decipher.update(conferenceData.key, 'base64', 'utf8');
    conference += decipher.final('utf8');
    return JSON.parse(conference);
  }catch(e){
    return null;
  }
}
