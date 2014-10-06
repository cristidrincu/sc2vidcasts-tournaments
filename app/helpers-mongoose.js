var mongoose = require('mongoose');
var Tournament = require('./models/tournament.js');
var User = require('./models/user.js');
var Avatar = require('./models/avatar.js');
var ErrorHandler = require('./helpers-error-handlers.js');
var _ = require('underscore');
var Q = require('q');

exports.getUserDetails = function(id, cb){
  User.findById(id).populate('local.avatar').exec(function(err, user){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea detaliilor pentru utilizator' + err);
    cb(user);
  });
}

exports.getDefaultAvatar = function(cb){
	Avatar.findOne( { 'imageRaceCategory': 'default' }).exec(function(err, avatar){
		cb(avatar);
	});
}

exports.compareUserId = function(userId, anotherId, cb){
	var comparisonResult = false;
	if(userId != anotherId){
		comparisonResult = true;
	}

		return cb(comparisonResult);
}

exports.setAvatarForUser = function(userId, avatarId, cb){
  User.findByIdAndUpdate(userId, {$set: {'local.avatar': []}}, function(err){
    if(!err){
      User.findByIdAndUpdate(userId,  { $push: { 'local.avatar': avatarId} }, function(err, user){
        if(err){
          throw new err;
        }else{
          cb(user);
        }
      });
    }
  });
}

exports.retrieveAllOrganizers = function(cb){
	//TODO - Implement Q.deffered() and use promises
  User.find( {'local.role': 'Organizator'}).exec(function(err, organizers){
    if(err){
      ErrorHandler.handle('A aparut o eroare in preluarea organizatorilor din baza de date' + err);
    }else{
      cb(organizers);
    }
  });
}

exports.retrieveAllTournaments = function(cb){
	//TODO - Implement Q.deffered() and use promises
  Tournament.find().sort( {tournamentName : 1} ).exec(function(err, tournaments){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea turneelor din baza de date' + err);
    else
      cb(tournaments);
  });
}

exports.retrieveAllPlayers = function(){
		var deferred = Q.defer();
	  User.find( {'local.role' : 'User'}).populate('local.avatar').sort({ 'local.nickname': 1 }).exec(function(err, players){
		  if(err)
			  deferred.reject(ErrorHandler.handle('A aparut o eroare in preluarea jucatorilor din baza de date' + err));
		  else
			  deferred.resolve(players);
	  });

	return deferred.promise;
}

//exports.retrieveTournamentsAndPlayers = function(cb){
//  exports.retrieveAllPlayers(function(players){
//    exports.retrieveAllTournaments(function(tournaments){
//      cb(players, tournaments);
//    })
//  });
//}

//TODO - Implement Q.deffered() and use promises
exports.retrieveTournamentsAndOrganizers = function(cb){
  exports.retrieveAllTournaments(function(tournaments){
    exports.retrieveAllOrganizers(function(organizers){
      cb(tournaments, organizers);
    });
  });
}

//TODO - Implement Q.deffered() and use promises
exports.retrieveTournamentsByOrganizer = function(organizerId, cb){
  Tournament.find( {'organizer': organizerId}).exec(function(err, tournaments){
    if(err){
      ErrorHandler.handle('A aparut o eroare in preluarea din baza de date a turneelor organizate')
    }else{
      cb(tournaments);
    }
  });
}

//TODO - Implement Q.deffered() and use promises. We use defer because we are using an asynchronous callback - function(err, tournaments).
exports.retrieveTournamentLeagues = function(tournamentId, cb){
  Tournament.findById(tournamentId).populate('players').exec(function(err, tournaments){
    if(err)
      ErrorHandler.handle('A aparut o eroare in preluarea ligilor pentru acest turneu' + err);
    else
      cb(tournaments.openForLeagues.leagues);
  });
}

exports.retrievePlayersFromTournament = function(tournamentId){
		var deferred = Q.defer();
	  Tournament.findById(tournamentId).populate('players').exec(function(err, tournament){
		  if(err)
			  deferred.reject(err);
		  if(tournament){
			  User.populate(tournament.players, {path: 'local.avatar'},  function(err, players){
				  deferred.resolve(players);
			  });
		  }
	  });

	return deferred.promise;
}

exports.retrieveAllTournamentPlayersBasedOnLeagues = function(tournamentId, cb){
		exports.retrievePlayersFromTournament(tournamentId).then(function(players){
				cb(players);
		});
}

exports.retrieveAvatars = function(){
	var deferred = Q.defer();

	Avatar.find().exec(function(err, avatars){
		if(err){
			deferred.reject(err);
		}
		deferred.resolve(avatars);
	});

	return deferred.promise;
}

