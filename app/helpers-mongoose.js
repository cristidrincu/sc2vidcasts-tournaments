var mongoose = require('mongoose');
var Tournament = require('./models/tournament.js');
var User = require('./models/user.js');
var Avatar = require('./models/avatar.js');
var ErrorHandler = require('./helpers-error-handlers.js');

exports.getUserDetails = function(id, cb){
  User.findById(id).exec(function(err, user){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea detaliilor pentru utilizator' + err);
    cb(user);
  });
}

exports.retrieveAllOrganizers = function(cb){
  User.find( {'local.role': 'Organizator'}).exec(function(err, organizers){
    if(err){
      ErrorHandler.handle('A aparut o eroare in preluarea organizatorilor din baza de date' + err);
    }else{
      cb(organizers);
    }
  });
}

exports.retrieveAllTournaments = function(cb){
  Tournament.find().sort( {tournamentName : 1} ).exec(function(err, tournaments){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea turneelor din baza de date' + err);
    else
      cb(tournaments);
  });
}

exports.retrieveAllPlayers = function(cb){
  User.find( {'local.role' : 'User'}).sort({ 'local.nickname': 1 }).exec(function(err, players){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea jucatorilor din baza de date' + err);
    else
      cb(players);
  });
}

exports.retrieveTournamentsAndPlayers = function(cb){
  exports.retrieveAllPlayers(function(players){
    exports.retrieveAllTournaments(function(tournaments){
      cb(players, tournaments);
    })
  });
}

exports.retrieveTournamentsAndOrganizers = function(cb){
  exports.retrieveAllTournaments(function(tournaments){
    exports.retrieveAllOrganizers(function(organizers){
      cb(tournaments, organizers);
    });
  });
}

exports.retrieveTournamentsByOrganizer = function(organizerId, cb){
  Tournament.find( {'organizer': organizerId}).exec(function(err, tournaments){
    if(err){
      ErrorHandler.handle('A aparut o eroare in preluarea din baza de date a turneelor organizate')
    }else{
      cb(tournaments);
    }
  });
}

exports.retrieveTournamentLeagues = function(tournamentId, cb){
  Tournament.findById(tournamentId).populate('players').exec(function(err, tournaments){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea ligilor pentru acest turneu' + err);
    else
      cb(tournaments.openForLeagues.leagues);
  });
}

exports.retrieveBronzePlayers = function(cb){
  User.find( {'local.league': 'Bronze', 'local.role': 'User'}).sort( {'local.nickname': 1} ).limit(10).exec(function(err, bronzers){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea jucatorilor bronze din baza de date' + err);
    cb(bronzers);
  });
}

exports.retrieveSilverPlayers = function(cb){
  User.find( {'local.league': 'Silver', 'local.role': 'User'}).sort( { 'local.nickname': 1 } ).exec(function(err, silvers){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea jucatorilor silver din baza de date' + err);
    cb(silvers);
  });
}

exports.retrieveGoldPlayers = function(cb){
  User.find( {'local.league': 'Gold', 'local.role': 'User'}).sort( { 'local.nickname': 1} ).exec(function(err, golds){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea jucatorilor gold din baza de date' + err);
    cb(golds);
  });
}

exports.retrievePlatinumPlayers = function(cb){
  User.find( {'local.league': 'Platinum', 'local.role': 'User'}).sort( { 'local.nickname': 1}).exec(function(err, platinums){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea jucatorilor platinum din baza de date' + err);
    cb(platinums);
  });
}

exports.retrieveDiamondPlayers = function(cb){
  User.find( {'local.league': 'Diamond', 'local.role': 'User'}).sort( { 'local.nickname': 1}).exec(function(err, diamonds){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea jucatorilor diamond din baza de date' + err);
    cb(diamonds);
  });
}

exports.retrieveMasterPlayers = function(cb){
  User.find( {'local.league': 'Master', 'local.role': 'User'}).sort( { 'local.nickname': 1}).exec(function(err, masters){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea jucatorilor master din baza de date' + err);
    cb(masters);
  });
}

exports.retrieveGMPlayers = function(cb){
  User.find( {'local.league': 'Grand Master', 'local.role': 'User'}).sort( { 'local.nickname': 1} ).exec(function(err, gm){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea jucatorilor grand master din baza de date' + err);
    cb(gm);
  });
}

exports.retrieveTerranAvatars = function(cb){
  Avatar.find( {'imageRaceCategory': 'terran'}).exec(function(err, avatars){
    if(err)
      throw err
    else
      cb(avatars);
  });
}

