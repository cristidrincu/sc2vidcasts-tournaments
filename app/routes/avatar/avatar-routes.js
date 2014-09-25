/**
 * Created by cristiandrincu on 9/25/14.
 */
var express = require('express');
var mongoose = require('mongoose');
var helperFunctions = require('../../../app/helpers-mongoose.js');
var User = require('../../../app/models/user');
var Avatar = require('../../../app/models/avatar');
var moment = require('moment');
var app = module.exports = express();

app.post('/choose-avatar/:userId/:avatarId', isLoggedIn, function(req, res){
  helperFunctions.setAvatarForUser(req.params.userId, req.params.avatarId, function(user){
    if(user.local.role === 'admin'){
      res.redirect('/backend-admin/' + req.params.userId);
    }else if(user.local.role === 'Organizator'){
      res.redirect('/backend-organizer')
    }else{
      res.redirect('/backend-user');
    }
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
}




