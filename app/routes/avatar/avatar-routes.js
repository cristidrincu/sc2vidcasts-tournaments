/**
 * Created by cristiandrincu on 9/25/14.
 */
var express = require('express');
var mongoose = require('mongoose');
var helperFunctions = require('../../helpers/helpers-mongoose.js');
var User = require('../../../app/models/user');
var Avatar = require('../../../app/models/avatar');
var moment = require('moment');
var middleware = require('../../helpers/helpers-middleware.js');

var EventEmitter = require('events').EventEmitter;
var blockUIEvent = new EventEmitter();

var app = module.exports = express();

blockUIEvent.on('blockUI', function() {
    //TODO - investigate event emmiters in NodeJS
    console.log('Blocking UI...');
});

blockUIEvent.on('stopBlockingUI', function() {
    //TODO - investigate event emmiters in NodeJS
    console.log('Stopped blocking UI!');
});

app.post('/choose-avatar/:userId/:avatarId', middleware.isLoggedIn, function(req, res){
  blockUIEvent.emit('blockUI', function() {
       //TODO - investigate event emmiters in NodeJS
  });

  helperFunctions.setAvatarForUser(req.params.userId, req.params.avatarId).then(function(user){
    if(user.local.role === 'admin'){
      res.redirect('/backend-admin/' + req.params.userId);
    }else if(user.local.role === 'Organizator'){
      res.redirect('/backend-organizer/' + req.params.userId);
    }else{
      res.redirect('/backend-user/' + req.params.userId);
    }

  blockUIEvent.emit('stopBlockingUI', function() {
      //TODO - investigate event emmiters in NodeJS
  });
 });
});




