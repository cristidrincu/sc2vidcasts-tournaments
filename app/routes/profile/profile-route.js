/**
 * Created by cristiandrincu on 9/4/14.
 */
var express = require('express');
var helperFunctions = require('../../../app/helpers-mongoose.js');
var User = require('../../../app/models/user');
var app = module.exports = express();

var retrievedTournaments = null;
helperFunctions.retrieveAllTournaments(function(tournaments){
  retrievedTournaments = tournaments;
});

/* PROFILE ROUTES */
app.get('/profile', isLoggedIn, function (req, res) {
  res.render('profile/profile.ejs', {
    message: req.flash('signupSuccess'), //get the message out of the session and pass to template
    user: req.user //get the user out of session and pass to template
  });
});

app.get('/profile-details/:_id', isLoggedIn, function(req, res){
  helperFunctions.getUserDetails(req.params._id, function(user){
    res.render('profile/profile-details.ejs', {
      user: req.user,
      detailedUser: user
    });
  });
});

app.get('/customize-profile/:nickname', isLoggedIn, function(req, res){
  res.render('profile/customize-profile.ejs', {
    user: req.user//get the user out of session and pass to template
  });
});

app.post('/customize-profile/:nickname', isLoggedIn, function(req, res){
  User.findOne({ 'local.nickname': req.params.nickname}, function(err, user){
    if(err)
      res.send('Utilizatorul nu a putut fi gasit');

    user = req.user;
    user.local.email = req.body.email;
    user.local.nickname = req.body.nickname;
    user.local.race = uppercaseFirstChar(req.body.race);
    user.local.league = uppercaseFirstChar(req.body.league);

    user.save(function(err){
      if(err)
        res.send('failed to update user');

      res.redirect('/profile');
    });
  });
});

/*ROUTE MIDDLEWARE - MAKE SURE A USER IS LOGGED IN*/
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
}

function uppercaseFirstChar(text){
  return text[0].toUpperCase() + text.slice(1);
}
