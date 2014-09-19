/**
 * Created by cristiandrincu on 9/4/14.
 */
var express = require('express');
var Tournament = require('../../models/tournament');
var moment = require('moment');
var helperFunctions = require('../../../app/helpers-mongoose.js');

var app = module.exports = express();

var retrievedTournaments = null;
var retrievedPlayers = null;

helperFunctions.retrieveAllTournaments(function(tournaments){
  retrievedTournaments = tournaments;
});

helperFunctions.retrieveAllPlayers(function(players){
  retrievedPlayers = players;
});

/*BACK-END ROUTES*/
app.get('/backend-admin', isLoggedIn, requireRole('admin'), function(req, res){
  helperFunctions.retrieveTournamentsAndPlayers(function(players, tournaments){
    res.render('backend/backend-admin.ejs', {
      user: req.user,
      tournaments: tournaments,
      players: players
    });
  });
});

app.get('/backend-organizer', isLoggedIn, requireRole('Organizator'), function(req, res){
  res.render('backend/backend-organizer.ejs', {
    user: req.user,
    tournaments: retrievedTournaments
  });
});

app.get('/backend-user', isLoggedIn, function(req, res){
  Tournament.find(function(err, tournaments){
    if(err)
      res.send('Error while retrieving tournaments');

    res.render('backend/backend-user.ejs', {
      user: req.user,
      tournaments: tournaments,
      moment: moment
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

function requireRole(role){
  return function(req, res, next){
    if(req.user.local.role === role){
      next();
    }
    else{
      res.send(403);
    }
  }
}