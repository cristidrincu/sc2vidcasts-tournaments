/**
 * Created by cristiandrincu on 9/4/14.
 */
var express = require('express');
var Tournament = require('../../models/tournament');
var User = require('../../models/user');
var Avatar = require('../../models/avatar');
var TournamentNotificationMessages = require('../../helpers/helpers-tournament-error-messages.js');
var moment = require('moment');
var placeHolderText = require('../../../config/validation-placeholders-text.js');
var _ = require('underscore');

var emailHelpers = require('../../helpers/helpers-email.js');

var helperFunctions = require('../../helpers/helpers-mongoose.js');
var middleware = require('../../helpers/helpers-middleware.js');

require('express-expose'); //for exposing users to auto complete functionality

var app = module.exports = express();

/* TOURNAMENT ROUTES */
app.get('/open-tournaments/:userId', middleware.isLoggedIn, function (req, res) {
    helperFunctions.getUserDetails(req.params.userId).then(function (user) {
        helperFunctions.retrieveAllTournaments().then(function (tournaments) {
            res.render('tournament/open-tournaments.ejs', {
                user: req.user,
                avatarUser: user,
                tournaments: tournaments,
                moment: moment
            });
        });
    });
});

app.get('/closed-tournaments/:userId', middleware.isLoggedIn, function (req, res) {
    helperFunctions.getUserDetails(req.params.userId).then(function (user) {
        helperFunctions.retrieveClosedTournaments().then(function (tournaments) {
            res.render('tournament/closed-tournaments.ejs', {
                user: req.user,
                avatarUser: user,
                tournaments: tournaments,
                moment: moment
            });
        });
    });
});


app.get('/create-tournament/:organizerId', middleware.isLoggedIn, middleware.requireRole('Organizator'), function (req, res) {
    res.render('tournament/create-tournament.ejs', {
        user: req.user,
        placeholders: placeHolderText
    });
});

app.get('/create-tournament-results', middleware.isLoggedIn, middleware.requireRole('Organizator'), function (req, res) {
    res.render('tournament/create-tournament-results.ejs', {
        user: req.user,
        errorMessage: req.flash('infoError'),
        successMessage: req.flash('infoSuccess')
    });
});

app.post('/create-tournament', middleware.isLoggedIn, middleware.requireRole('Organizator'), function (req, res) {

    Tournament.findOne({
        'tournament.edition': req.body.edition,
        'tournament.tournamentName': req.body.tournamentName
    }, function (err, newTournament) {
        if (newTournament)
            req.flash('infoError', 'O editie a acestui turneu exista deja');
        else
            newTournament = new Tournament();
            newTournament.tournamentName = req.body.tournamentName;
            newTournament.nrOfPlayers = req.body.nrOfPlayers;
            newTournament.openForLeagues.leagues = req.body.leagues;
            newTournament.edition = req.body.edition;
            newTournament.description = req.body.description;
            newTournament.startDate = req.body.startDate;
            newTournament.endDate = req.body.endDate;
            newTournament.startHour = req.body.startHour;
            newTournament.prize = req.body.prize;
            newTournament.sponsors = req.body.sponsors;
            newTournament.ingameChatChannel = req.body.ingameChatChannel;
            newTournament.twitchStreamChannel = 'http://www.twitch.tv/' + req.body.twitchStreamChannel;
            newTournament.finishedTournament = false;
            newTournament.organizer = req.user._id;
            newTournament.bracketsPublished = false;
            newTournament.bracketsLink = '';

        User.find({
            'local.role': 'User',
            'local.league': {$in: newTournament.openForLeagues.leagues}
        }, function (err, players) {
            if (err) throw err;
            emailHelpers.newTournamentCreated(players, newTournament);
        });

        newTournament.save(function (err) {
            if (err)
                req.flash('infoError', 'A aparut o eroare la creearea turneului. Mai incearca!');
            else
                req.flash('infoSuccess', '\'' + newTournament.tournamentName + '\' a fost creat cu succes!');

            res.redirect('/create-tournament-results');
        });
    });
});

//TODO - REFACTOR MONGOOSE QUERY METHODS FOR TOURNAMENT INTO METHODS THAT RESIDE INSIDE NODE MODULES - SEE HELPER-MONGOOSE.JS
app.get('/tournament-details/:_id/:userId', middleware.isLoggedIn, function (req, res) {

    var enlistedInTournament = false;
    var eligibleForTournament = false;
    var allPlacesTaken = false;


    User.find({_id: req.params.userId}).populate('local.avatar').exec(function (err, playersRetrieved) {
        var ids = playersRetrieved.map(function (player) {
            return player._id;
        });

        Tournament.findOne({_id: req.params._id, players: {$in: ids}}, function (err, tournament) {
            if (tournament) {
                enlistedInTournament = true;
                return enlistedInTournament;
            }
        });

        Tournament.findById(req.params._id).populate('players organizer bracket winner').exec(function (err, tournament) {
            if (err) {
                res.send(err);
            } else {
                tournament.openForLeagues.leagues.forEach(function (league) {
                    if (req.user.local.league === league) {
                        eligibleForTournament = true;
                        return eligibleForTournament;
                    }
                });

                helperFunctions.retrieveAllTournamentPlayersBasedOnLeagues(req.params._id, function (playersFromCollection) {
                    var autocompletePlayersTournament = _.map(playersFromCollection, function (player) {
                        return player.local.nickname;
                    });
                    helperFunctions.getUserDetails(req.params.userId).then(function (user) {
                        res.expose(autocompletePlayersTournament, 'playersTournament');
                        res.render('tournament/tournament-details.ejs', {
                            user: req.user,
                            tournament: tournament,
                            currentDate: new Date(),
                            userAvatar: user,
                            userId: req.params.userId,
                            bronzePlayers: _.filter(playersFromCollection, function (player) {
                                if (player.local.league === 'Bronze') {
                                    return player;
                                }
                            }),
                            silverPlayers: _.filter(playersFromCollection, function (player) {
                                if (player.local.league === 'Silver') {
                                    return player;
                                }
                            }),
                            goldPlayers: _.filter(playersFromCollection, function (player) {
                                if (player.local.league === 'Gold') {
                                    return player;
                                }
                            }),
                            platinumPlayers: _.filter(playersFromCollection, function (player) {
                                if (player.local.league === 'Platinum') {
                                    return player;
                                }
                            }),
                            diamondPlayers: _.filter(playersFromCollection, function (player) {
                                if (player.local.league === 'Diamond') {
                                    return player;
                                }
                            }),
                            mastersPlayers: _.filter(playersFromCollection, function (player) {
                                if (player.local.league === 'Master') {
                                    return player;
                                }
                            }),
                            grandMasterPlayers: _.filter(playersFromCollection, function (player) {
                                if (player.local.league === 'Grand Master') {
                                    return player;
                                }
                            }),
                            moment: moment,
                            enlistedInTournament: enlistedInTournament,
                            eligibleForTournament: eligibleForTournament,
                            allPlacesTaken: allPlacesTaken,
                            procentajOcupare: (tournament.players.length * (100 / tournament.nrOfPlayers)),
                            tournamentStatus: middleware.tournamentStatus(tournament),
                            tournamentNotificationMessages: TournamentNotificationMessages
                        });
                    });
                });
            }
        });
    });
});

app.post('/signup-tournament/:_id/:userId', middleware.isLoggedIn, function (req, res) {
    User.find({_id: req.params.userId}, function (err, players) {
        var ids = players.map(function (player) {
            return player._id;
        });

        Tournament.findOne({_id: req.params._id, players: {$in: ids}}, function (err, players) {
            if (err) {
                res.send(ErrorHandler.handle('A aparut o eroare: ' + err));
            }

            if (players) {
                res.send('Esti deja inscris in cadrul acestui turneu!');
            } else if (!players) {
                Tournament.findById(req.params._id, function (err, tournament) {
                    if (err) {
                        res.send(err);
                    }

                    if (tournament) {
                        var placesForPlayers = tournament.nrOfPlayers;
                        var playerPlacesTaken = tournament.players.length;

                        if (playerPlacesTaken >= placesForPlayers) {
                            req.flash('infoError', 'Toate locurile au fost ocupate!');
                        } else {
                            Tournament.findByIdAndUpdate(req.params._id, {$pushAll: {players: [req.params.userId]}}, function (err) {
                                if (err) throw err;
                                User.findByIdAndUpdate(req.params.userId, {$pushAll: {'local.tournaments': [req.params._id]}}, function (err) {
                                    if (err)
                                        res.send(err);
                                    res.redirect('/user-tournaments/' + req.params.userId);
                                });
                            });
                        }
                    }
                });
            }
        });
    });
});

app.get('/user-tournaments/:userId', middleware.isLoggedIn, function (req, res) {
    User.findById(req.params.userId).populate('local.tournaments local.avatar').exec(function (err, user) {
        if (err)
            res.send(err);
        else
            res.render('tournament/user-tournaments.ejs', {
                user: req.user,
                activeTournaments: _.filter(user.local.tournaments, function (tournament) {
                    if (!tournament.finishedTournament) {
                        return tournament;
                    }
                }),
                inactiveTournaments: _.filter(user.local.tournaments, function (tournament) {
                    if (tournament.finishedTournament) {
                        return tournament;
                    }
                }),
                userAvatar: user,
                moment: moment,
                errorMessage: req.flash('infoError'),
                successMessage: req.flash('infoSuccess')
            });
    });
});

app.post('/retragere-din-turneu/:_userId/:_tournamentId', middleware.isLoggedIn, function (req, res) {
    Tournament.findByIdAndUpdate({_id: req.params._tournamentId}, {$pull: {players: req.params._userId}}, function (err) {
        if (err) res.send(err);

        User.findByIdAndUpdate({_id: req.params._userId}, {$pull: {'local.tournaments': req.params._tournamentId}}, function (err) {
            if (err) {
                req.flash('infoError', 'A aparut o eroare la scoaterea ta din turneu. Mai incearca!');
            } else {
                req.flash('infoSuccess', 'Te-ai retras cu succes din cadrul turneului!');
                res.redirect('/user-tournaments/' + req.params._userId);
            }
        });
    });
});

app.post('/declare-winner/:tournamentId/:userId', middleware.isLoggedIn, middleware.requireMultipleUserRoles('Organizator', 'admin'), function (req, res) {
    helperFunctions.getUserIdFromName(req.body.winnerName).then(function (userId) {
        Tournament.findById(req.params.tournamentId).exec(function (err, tournament) {
            tournament.winner.push(userId);
            tournament.save(function (err) {
                if (err) throw err;

                res.redirect('/tournament-details/' + req.params.tournamentId + '/' + req.params.userId);
            });
        });
    });
});

app.get('/delete-tournament/:tournamentId/:userId', middleware.isLoggedIn, middleware.requireRole('admin'), function (req, res) {
    helperFunctions.getUserDetails(req.params.userId).then(function (user) {
        helperFunctions.retrieveTournamentDetails(req.params.tournamentId).then(function (tournament) {
            res.render('tournament/delete/delete-tournament.ejs', {
                user: req.user,
                userAvatar: user,
                tournament: tournament,
                moment: moment
            });
        });
    });
});

app.post('/delete-tournament/:tournamentId/:userId', middleware.isLoggedIn, middleware.requireRole('admin'), function (req, res) {
    Tournament.remove({_id: req.params.tournamentId}, function (err, result) {
        if (err) throw err;

        res.redirect('/closed-tournaments/' + req.params.userId);
    });
});

app.post('/send-brackets-players/:tournamentId/:userId', middleware.isLoggedIn, middleware.requireRole('Organizator'), function (req, res) {
    helperFunctions.getUserDetails(req.params.userId).then(function (user) {
        helperFunctions.retrieveTournamentDetails(req.params.tournamentId).then(function (tournament) {
            Tournament.findByIdAndUpdate(req.params.tournamentId, {
                bracketsPublished: true,
                bracketsLink: req.body.tournamentBracketLink
            }, function (error) {
                if (error) res.send(error);

                emailHelpers.sendBracketsToTournamentPlayers(tournament.players, tournament.tournamentName, req.body.tournamentBracketLink, function (error) {
                    if (error) {
                        res.render('error-pages/error-sending-email.ejs', {
                            user: req.user,
                            userAvatar: user
                        });
                    }
                });
            });
        });
    });

    res.redirect('/tournament-details/' + req.params.tournamentId + '/' + req.params.userId);
});

app.post('/send-notification-players/:tournamentId/:userId', middleware.isLoggedIn, middleware.requireRole('Organizator'), function (req, res) {
    helperFunctions.getUserDetails(req.params.userId).then(function (user) {
        helperFunctions.retrieveTournamentDetails(req.params.tournamentId).then(function (tournament) {
            emailHelpers.sendNotificationToPlayers(tournament.players, tournament.tournamentName, req.body.notificationMsg, function (error, response) {
                if (error) {
                    res.render('error-pages/error-sending-email.ejs', {
                        user: req.user,
                        userAvatar: user
                    });
                }

//					console.log(response);
            });
        });
    });

    res.redirect('/tournament-details/' + req.params.tournamentId + '/' + req.params.userId);
});