/**
 * Created by cristiandrincu on 9/4/14.
 */
var express = require('express');
var Tournament = require('../../models/tournament');
var User = require('../../models/user');
var Avatar = require('../../models/avatar');
var moment = require('moment');
var helperFunctions = require('../../../app/helpers-mongoose.js');
var placeHolderText = require('../../../config/validation-placeholders-text.js');
var _ = require('underscore');

var app = module.exports = express();

/* TOURNAMENT ROUTES */
app.get('/open-tournaments/:userId', function(req, res){
  helperFunctions.getUserDetails(req.params.userId).then(function(user){
    helperFunctions.retrieveAllTournaments().then(function(tournaments){
      res.render('tournament/open-tournaments.ejs', {
        user: req.user,
        avatarUser: user,
        tournaments: tournaments,
        moment: moment
      });
    });
  });
});


app.get('/create-tournament/:organizerId', isLoggedIn, requireRole('Organizator'), function(req, res){
  res.render('tournament/create-tournament.ejs', {
    user: req.user,
    placeholders: placeHolderText
  });
});

app.get('/create-tournament-results', isLoggedIn, requireRole('Organizator'), function(req, res){
  res.render('tournament/create-tournament-results.ejs', {
    user: req.user,
    errorMessage: req.flash('infoError'),
    successMessage: req.flash('infoSuccess')
  });
});

app.post('/create-tournament', isLoggedIn, requireRole('Organizator'), function(req, res){

  Tournament.findOne({ 'tournament.edition': req.body.edition, 'tournament.tournamentName' : req.body.tournamentName }, function(err, newTournament){
    if(newTournament)
      req.flash('infoError', 'O editie a acestui turneu exista deja')
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
      newTournament.organizer = req.user._id;

    newTournament.save(function(err){
      if(err)
        req.flash('infoError', 'A aparut o eroare la creearea turneului. Mai incearca!');
      else
        req.flash('infoSuccess', 'Turneul a fost creat cu succes!');

      res.redirect('/create-tournament-results');
    });
  });
});

//TODO - REFACTOR MONGOOSE QUERY METHODS FOR TOURNAMENT INTO METHODS THAT RESIDE INSIDE NODE MODULES - SEE HELPER-MONGOOSE.JS
app.get('/tournament-details/:_id/:userId', isLoggedIn, function(req, res){

  var enlistedInTournament = false;
  var eligibleForTournament = false;
  var allPlacesTaken = false;


  User.find( {_id: req.params.userId}).populate('local.avatar').exec(function(err, playersRetrieved){
    var ids = playersRetrieved.map(function(player){
      return player._id;
    });

    Tournament.findOne( { _id: req.params._id, players: {$in: ids}}, function(err, tournament){
      if(tournament){
        enlistedInTournament = true
        return enlistedInTournament;
      }
    });

    Tournament.findById(req.params._id).populate('players organizer bracket').exec( function(err, tournament){
      if(err){
        res.send(err)
      }else{
        tournament.openForLeagues.leagues.forEach(function(league){
          if(req.user.local.league === league){
            eligibleForTournament = true;
            return eligibleForTournament;
          }
      });

		    helperFunctions.retrieveAllTournamentPlayersBasedOnLeagues(req.params._id, function(playersFromCollection){
			    helperFunctions.getUserDetails(req.params.userId).then(function(user){
				    res.render('tournament/tournament-details.ejs',{
					    user: req.user,
					    tournament: tournament,
					    userAvatar: user,
					    userId: req.params.userId,
					    bronzePlayers: _.filter(playersFromCollection, function(player){
						    if(player.local.league === 'Bronze'){
							    return player;
						    }
					    }),
					    silverPlayers: _.filter(playersFromCollection, function(player){
						    if(player.local.league === 'Silver'){
							    return player;
						    }
					    }),
					    goldPlayers: _.filter(playersFromCollection, function(player){
						    if(player.local.league === 'Gold'){
							    return player;
						    }
					    }),
					    platinumPlayers: _.filter(playersFromCollection, function(player){
						    if(player.local.league === 'Platinum'){
							    return player;
						    }
					    }),
					    diamondPlayers: _.filter(playersFromCollection, function(player){
						    if(player.local.league === 'Diamond'){
							    return player;
						    }
					    }),
					    mastersPlayers: _.filter(playersFromCollection, function(player){
						    if(player.local.league === 'Master'){
							    return player;
						    }
					    }),
					    grandMasterPlayers: _.filter(playersFromCollection, function(player){
						    if(player.local.league === 'Grand Master'){
							    return player;
						    }
					    }),
					    moment: moment,
					    enlistedInTournament: enlistedInTournament,
					    eligibleForTournament: eligibleForTournament,
					    allPlacesTaken: allPlacesTaken,
					    procentajOcupare: (tournament.players.length * (100 / tournament.nrOfPlayers))
				    });
			    });
		    });



      }
    });
  });
});

app.post('/signup-tournament/:_id/:userId', isLoggedIn, function(req, res){
  User.find({_id: req.params.userId}, function(err, players){
    var ids = players.map(function(player) {
      return player._id;
    });

    Tournament.findOne( {_id: req.params._id, players: {$in: ids}}, function(err, players){
      if(err){
        res.send(ErrorHandler.handle('A aparut o eroare: ' + err));
      }

      if(players){
        //TODO - replace with proper error view - present other tournaments that the user can enlist into
        res.send('Esti deja inscris in cadrul acestui turneu!');
      }else if(!players){
        Tournament.findById(req.params._id, function(err, tournament){
          if(err){
            res.send(err);
          }

          if(tournament){
            var placesForPlayers = tournament.nrOfPlayers;
            var playerPlacesTaken = tournament.players.length;

            if(playerPlacesTaken >= placesForPlayers){
              //TODO - replace with proper error view - present other tournaments that the user can enlist into
              req.flash('infoError', 'Toate locurile au fost ocupate!');
            }else{
              Tournament.findByIdAndUpdate(req.params._id, { $pushAll: { players: [req.params.userId] }}, function(err){
	              if(err) throw err
		              User.findByIdAndUpdate(req.params.userId, { $pushAll: { 'local.tournaments': [req.params._id] }}, function(err){
			              if(err)
				              res.send(err)
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

app.get('/user-tournaments/:userId', isLoggedIn, function(req, res){
  User.findById(req.params.userId).populate('local.tournaments').populate('local.avatar').exec(function(err, user){
    if(err)
      res.send(err)
    else
      console.log(user.tournaments);
      res.render('tournament/user-tournaments.ejs', {
        user: req.user,
        playerTournamentsUser: user,
	      userAvatar: user,
        moment: moment,
        errorMessage: req.flash('infoError'),
        successMessage: req.flash('infoSuccess')
      });
  });
});

app.post('/retragere-din-turneu/:_userId/:_tournamentId', isLoggedIn, function(req, res){
  Tournament.findById(req.params._tournamentId).exec(function(err, tournament){
    if(!err){
      var playerId = tournament.players.indexOf(req.params._userId);
      if(playerId != -1)
        tournament.players.splice(playerId, 1);
      tournament.save(function(err){
        if(err)
          req.flash('infoError', 'A aparut o eroare la scoaterea ta din turneu. Mai incearca!');
        else
          User.findById(req.params._userId).exec(function(err, user){
            if(!err){
              var tournamentId = user.local.tournaments.indexOf(req.params._tournamentId);
              if(tournamentId != -1){
                user.local.tournaments.splice(tournamentId, 1);
                user.save(function(err){
                  if(err)
                    res.send(err)
                  else
                    req.flash('infoSuccess', 'Te-ai retras cu succes din cadrul turneului!');
                })
              }
            }
          });

        res.redirect('/user-tournaments/' + req.params._userId);
      });
    }else{
      res.send(err);
    }
  });
});

app.post('/create-brackets/:tournamentId', isLoggedIn, requireRole('Organizator'), function(req, res){

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
    if(req.user.local.role == role){
      next();
    }
    else{
      res.send(403);
    }
  }
}