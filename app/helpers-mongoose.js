var mongoose = require('mongoose');
var Tournament = require('./models/tournament.js');
var User = require('./models/user.js');
var ErrorHandler = require('./helpers-error-handlers.js');

exports.getUserDetails = function(id, cb){
  User.findById(id).exec(function(err, user){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea detaliilor pentru utilizator' + err);
    cb(user);
  });
}

exports.retrieveAllTournaments = function(cb){
  Tournament.find().exec(function(err, tournaments){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea turneelor din baza de date' + err);
    else
      cb(tournaments);
  });
}

exports.retrieveTournamentDetails = function(tournamentId, cb){
  Tournament.findOne( {'_id': tournamentId }).exec(function(err, tournament){
    if(err)
      ErrorHandler.handle('Nu am putut sa iti scoatem turneul din baza de date ' + err);
    else
      cb(tournament);
  });
}

exports.retrieveTournamentLeagues = function(tournamentId, cb){
  Tournament.findById(tournamentId).exec(function(err, tournaments){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea ligilor pentru acest turneu' + err);
    else
      cb(tournaments.openForLeagues.leagues);
  });
}

exports.retrieveBronzePlayers = function(cb){
  User.find( {'local.league': 'Bronze', 'local.role': 'User'}).limit(10).exec(function(err, bronzers){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea jucatorilor bronze din baza de date' + err);
    cb(bronzers);
  });
}

exports.retrieveSilverPlayers = function(cb){
  User.find( {'local.league': 'Silver', 'local.role': 'User'}).exec(function(err, silvers){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea jucatorilor silver din baza de date' + err);
    cb(silvers);
  });
}

exports.retrieveGoldPlayers = function(cb){
  User.find( {'local.league': 'Gold', 'local.role': 'User'}).exec(function(err, golds){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea jucatorilor gold din baza de date' + err);
    cb(golds);
  });
}

exports.retrievePlatinumPlayers = function(cb){
  User.find( {'local.league': 'Platinum', 'local.role': 'User'}).exec(function(err, platinums){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea jucatorilor platinum din baza de date' + err);
    cb(platinums);
  });
}

exports.retrieveDiamondPlayers = function(cb){
  User.find( {'local.league': 'Diamond', 'local.role': 'User'}).exec(function(err, diamonds){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea jucatorilor diamond din baza de date' + err);
    cb(diamonds);
  });
}

exports.retrieveMasterPlayers = function(cb){
  User.find( {'local.league': 'Master', 'local.role': 'User'}).exec(function(err, masters){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea jucatorilor master din baza de date' + err);
    cb(masters);
  });
}

exports.retrieveGMPlayers = function(cb){
  User.find( {'local.league': 'Grand Master', 'local.role': 'User'}).exec(function(err, gm){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea jucatorilor grand master din baza de date' + err);
    cb(gm);
  });
}

