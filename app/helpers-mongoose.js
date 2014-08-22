var mongoose = require('mongoose');
var Tournament = require('./models/tournament.js');
var User = require('./models/user.js');
var ErrorHandler = require('./helpers-error-handlers.js');

exports.retrieveAllTournaments = function(cb){
  Tournament.find().exec(function(err, tournaments){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea turneelor din baza de date' + err);
    else
      cb(tournaments);
  });
}

exports.retrieveAllTerranPlayers = function(cb){
  User.find( { 'local.race': 'Terran', 'local.role': 'User' } ).exec(function(err, terrans){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea jucatorilor terrani din baza de date' + err);
    cb(terrans);
  });
}

exports.retrieveAllZergPlayers = function(cb){
  User.find( { 'local.race': 'Zerg', 'local.role': 'User' } ).exec(function(err, zergs){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea jucatorilor zergi din baza de date' + err);
    cb(zergs);
  });
}

exports.retrieveAllProtossPlayers = function(cb){
  User.find( { 'local.race': 'Protoss', 'local.role': 'User' } ).exec(function(err, protosses){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea jucatorilor protoss din baza de date' + err);
    cb(protosses);
  });
}

