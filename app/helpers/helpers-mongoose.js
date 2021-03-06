var mongoose = require('mongoose');
var Tournament = require('./../models/tournament.js');
var User = require('./../models/user.js');
var Avatar = require('./../models/avatar.js');
var Message = require('./../models/message.js');
var Quote = require('./../models/quote.js');
var ErrorHandler = require('./helpers-error-handlers.js');
var _ = require('underscore');
var Q = require('q');
var moment = require('moment');
var exceptions = require('./helpers-exceptions');

exports.getUserDetails = function (id) {
    var deferred = Q.defer();
    var mongooseEntityNotFound = exceptions.mongooseEntityNotFoundException;
    User.findById(id).populate('local.avatar local.tournaments').exec(function (err, user) {
        if (err) {
            deferred.reject(ErrorHandler.handle(mongooseEntityNotFound.message));
        }

        deferred.resolve(user);
    });

    return deferred.promise;
};

exports.getUserIdFromName = function (nickname) {
    var deffered = Q.defer();
    User.findOne({'local.nickname': nickname}).exec(function (err, user) {
        if (err) {
            deffered.reject(err);
        } else {
            deffered.resolve(user._id);
        }
    });

    return deffered.promise;
};

exports.getQuoteDetails = function (quoteId) {
    var deffered = Q.defer();
    Quote.findById(quoteId).populate('quoteInsertedBy').exec(function (err, quote) {
        if (err) {
            deffered.reject(err);
        }

        deffered.resolve(quote);
    });

    return deffered.promise;
};

exports.deleteQuote = function (quoteId, cb) {
    Quote.remove({_id: quoteId}).exec(function (err, writeResult) {
        if (err) throw err;
        cb(writeResult);
    });
};

exports.getDefaultAvatar = function () {
    var deferred = Q.defer();
    Avatar.findOne({'imageRaceCategory': 'default'}).exec(function (err, avatar) {
        if (err) {
            deferred.reject(err);
        }
        deferred.resolve(avatar);
    });

    return deferred.promise;
};

exports.compareUserId = function (userId, anotherId, cb) {
    var comparisonResult = false;
    if (userId != anotherId) {
        comparisonResult = true;
    }

    return cb(comparisonResult);
};

exports.checkTournamentsStatus = function (cb) {
    var currentDate = new Date();

    //check to see if the tournament is finished
    Tournament.find({}).exec(function (err, tournaments) {
        tournaments.forEach(function (tournament) {
            if (moment(currentDate).isAfter(tournament.endDate)) {
                tournament.finishedTournament = true;
                tournament.save(function (err) {
                    if (err) throw err;
                });
            }
        });

        cb();
    });
};

exports.setAvatarForUser = function (userId, avatarId) {
    var deferred = Q.defer();
    User.findByIdAndUpdate(userId, {$set: {'local.avatar': []}}, function (err) {
        if (!err) {
            User.findByIdAndUpdate(userId, {$push: {'local.avatar': avatarId}}, function (err, user) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(user);
                }
            });
        }
    });

    return deferred.promise;
};

exports.retrieveAllOrganizers = function () {
    var deferred = Q.defer();
    User.find({'local.role': 'Organizator'}).populate('local.avatar').exec(function (err, organizers) {
        if (err) {
            deferred.reject(ErrorHandler.handle('A aparut o eroare in preluarea organizatorilor din baza de date' + err));
        } else {
            deferred.resolve(organizers);
        }
    });

    return deferred.promise;
};

exports.retrieveAllTournaments = function () {
    var deferred = Q.defer();
    Tournament.find({finishedTournament: false}).sort({tournamentName: 1}).exec(function (err, tournaments) {
        if (err)
            deferred.reject(ErrorHandler.handle('A aparut o eroare in preluarea turneelor din baza de date' + err));
        else
            deferred.resolve(tournaments);
    });

    return deferred.promise;
};

exports.retrieveClosedTournaments = function () {
    var deferred = Q.defer();
    Tournament.find({finishedTournament: true}).sort({startDate: 1}).exec(function (err, closedTournaments) {
        if (err)
            deferred.reject(ErrorHandler.handle('A aparut o eroare in preluarea turneelor terminate din baza de date!' + err));
        else
            deferred.resolve(closedTournaments);
    });

    return deferred.promise;
};

exports.retrieveAllPlayers = function () {
    var deferred = Q.defer();
    User.find({'local.role': 'User'}).populate('local.avatar').sort({'local.nickname': 1}).exec(function (err, players) {
        if (err)
            deferred.reject(ErrorHandler.handle('A aparut o eroare in preluarea jucatorilor din baza de date' + err));
        else
            deferred.resolve(players);
    });

    return deferred.promise;
};

exports.retrieveTournamentsAndOrganizers = function (cb) {
    exports.retrieveAllTournaments().then(function (tournaments) {
        exports.retrieveAllOrganizers().then(function (organizers) {
            cb(tournaments, organizers);
        });
    });
};

exports.retrieveTournamentsByOrganizer = function (organizerId) {
    var deferred = Q.defer();
    Tournament.find({'organizer': organizerId}).exec(function (err, tournaments) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(tournaments);
        }
    });

    return deferred.promise;
};

exports.retrievePlayersFromTournament = function (tournamentId) {
    var deferred = Q.defer();
    Tournament.findById(tournamentId).populate('players').exec(function (err, tournament) {
        if (err)
            deferred.reject(err);
        if (tournament) {
            User.populate(tournament.players, {path: 'local.avatar'}, function (err, players) {
                deferred.resolve(players);
            });
        }
    });
    return deferred.promise;
};

exports.retrieveAllTournamentPlayersBasedOnLeagues = function (tournamentId, cb) {
    exports.retrievePlayersFromTournament(tournamentId).then(function (players) {
        cb(players);
    });
};

exports.retrieveMessagesForUser = function (userid) {
    var deferred = Q.defer();
    Message.find({'receiver': userid}).populate('sentBy').exec(function (err, messages) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(messages);
        }
    });

    return deferred.promise;
};

exports.retrieveTournamentDetails = function (tournamentId) {
    var deferred = Q.defer();
    Tournament.findById(tournamentId).populate('players organizer winner').exec(function (err, tournament) {
        if (err) {
            deferred.reject(tournament);
        }
        deferred.resolve(tournament);
    });
    return deferred.promise;
};

exports.retrieveAvatars = function () {
    var deferred = Q.defer();

    Avatar.find().exec(function (err, avatars) {
        if (err) {
            deferred.reject(err);
        }
        deferred.resolve(avatars);
    });

    return deferred.promise;
};

exports.retrieveQuotes = function () {
    var deferred = Q.defer();
    Quote.find({}).exec(function (err, quotes) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(quotes);
        }
    });

    return deferred.promise;
};