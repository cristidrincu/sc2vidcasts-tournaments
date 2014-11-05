var mongoose = require('mongoose');
var Tournament = require('./models/tournament.js');
var User = require('./models/user.js');
var Avatar = require('./models/avatar.js');
var Message = require('./models/message.js');
var Quote = require('./models/quote.js');
var ErrorHandler = require('./helpers-error-handlers.js');
var _ = require('underscore');
var Q = require('q');

//We use Q.defer when we are dealing with asynchronous callbacks, as the one below: function(err, user).
exports.getUserDetails = function(id){
	var deferred = Q.defer();
  User.findById(id).populate('local.avatar local.tournaments').exec(function(err, user){
    if(err){
	    deferred.reject(ErrorHandler.handle('A aparut o eroare in preluarea detaliilor pentru utilizator' + err));
    }
    deferred.resolve(user);
  });

	return deferred.promise;
}

exports.getUserIdName = function(nickname){
	var deffered = Q.defer();
	User.findOne( {'local.nickname': nickname}).exec(function(err, user){
		if(err){
			deffered.reject(err);
		}

		deffered.resolve(user._id);
	});

	return deffered.promise;
}

exports.getQuoteDetails = function(quoteId){
	var deffered = Q.defer();
	Quote.findById(quoteId).exec(function(err, quote){
		if(err){
			deffered.reject(err);
		}

		deffered.resolve(quote);
	});

	return deffered.promise;
}

exports.getDefaultAvatar = function(){
	var deferred = Q.defer();
	Avatar.findOne( { 'imageRaceCategory': 'default' }).exec(function(err, avatar){
		if(err){
			deferred.reject(err);
		}
		deferred.resolve(avatar);
	});

	return deferred.promise;
}

exports.compareUserId = function(userId, anotherId, cb){
	var comparisonResult = false;
	if(userId != anotherId){
		comparisonResult = true;
	}

		return cb(comparisonResult);
}

exports.setAvatarForUser = function(userId, avatarId){
	var deferred = Q.defer();
  User.findByIdAndUpdate(userId, {$set: {'local.avatar': []}}, function(err){
    if(!err){
      User.findByIdAndUpdate(userId,  { $push: { 'local.avatar': avatarId} }, function(err, user){
        if(err){
          deferred.reject(err);
        }else{
          deferred.resolve(user);
        }
      });
    }
  });

	return deferred.promise;
}

exports.retrieveAllOrganizers = function(){
	var deferred = Q.defer();
  User.find( {'local.role': 'Organizator'}).populate('local.avatar').exec(function(err, organizers){
    if(err){
      deferred.reject(ErrorHandler.handle('A aparut o eroare in preluarea organizatorilor din baza de date' + err));
    }else{
      deferred.resolve(organizers);
    }
  });

	return deferred.promise;
}

exports.retrieveAllTournaments = function(){
	var deferred = Q.defer();
  Tournament.find().sort( {tournamentName : 1} ).exec(function(err, tournaments){
    if(err)
      deferred.reject(ErrorHandler.handle('A aparut o eroare in preluarea turneelor din baza de date' + err));
    else
      deferred.resolve(tournaments);
  });

	return deferred.promise;
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

exports.retrieveTournamentsAndOrganizers = function(cb){
  exports.retrieveAllTournaments().then(function(tournaments){
    exports.retrieveAllOrganizers().then(function(organizers){
      cb(tournaments, organizers);
    });
  });
}


//TODO - refactor method as it does not remove tournaments and users
exports.retireFromTournament = function(tournamentId, userId){
	var deferred = Q.defer();
	Tournament.findById(tournamentId).exec(function(err, tournament){
		if(!err){
			tournament.players = _.filter(tournament.players, function(player){
				if(player._id != userId){
					return player;
				}
			});
			tournament.save(function(err){
				if(err)
					deferred.reject(err);
				else
					deferred.resolve(tournament);
			});
		}
	});

	User.findById(userId).populate('tournaments').exec(function(err, user){
		if(!err){
			user.local.tournaments = _.filter(user.local.tournaments, function(tournament){
				if(tournament._id != tournamentId){
					return tournament;
				}
				user.save(function(err){
					if(err)
						deferred.reject(err);
					else
						deferred.resolve(user);
				});
			});
		}
	});

	return deferred.promise;
}

exports.retrieveTournamentsByOrganizer = function(organizerId){
	var deferred = Q.defer();
  Tournament.find( {'organizer': organizerId}).exec(function(err, tournaments){
	  if(err){
		  deferred.reject(err);
	  }else{
		  deferred.resolve(tournaments);
	  }
  });

	return deferred.promise;
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

exports.retrieveMessagesForUser = function(userid){
	var deferred = Q.defer();
	Message.find( {'receiver': userid}).populate('sentBy').exec(function(err, messages){
		if(err){
			deferred.reject(err);
		}else{
			deferred.resolve(messages);
		}
	});

	return deferred.promise;
}

exports.retrieveTournamentDetails = function(tournamentId){
	var deferred = Q.defer();
	Tournament.findById(tournamentId).populate('players').exec(function(err, tournament){
		if(err){
			deferred.reject(tournament)
		}
		deferred.resolve(tournament);
	});
	return deferred.promise;
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

exports.retrieveQuotes = function(){
	var deferred = Q.defer();
	Quote.find().populate('quoteInsertedBy').exec(function(err, quotes){
		if(err){
			deferred.reject(err);
		}else{
			deferred.resolve(quotes);
		}
	});

	return deferred.promise;
}

//exports.createQuote = function(authorName, quoteText, cb){
//	var quote = new Quote();
//	quote.quoteAuthor = authorName;
//	quote.quoteText = quoteText;
//
//	quote.save(function(err){
//		if(err){
//			cb(err);
//		}
//	});
//}