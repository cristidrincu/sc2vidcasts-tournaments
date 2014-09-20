/**
 * Created by cristiandrincu on 9/4/14.
 */
var express = require('express');
var Tournament = require('../../models/tournament');
var User = require('../../models/user');
var moment = require('moment');
var helperFunctions = require('../../../app/helpers-mongoose.js');
var placeHolderText = require('../../../config/validation-placeholders-text.js');

var app = module.exports = express();

var retrievedTournaments = null;
helperFunctions.retrieveAllTournaments(function(tournaments){
  retrievedTournaments = tournaments;
});



/* TOURNAMENT ROUTES */
app.get('/open-tournaments', function(req, res){
  helperFunctions.retrieveAllTournaments(function(tournaments){
    res.render('tournament/open-tournaments.ejs', {
      user: req.user,
      tournaments: tournaments,
      moment: moment
    });
  });
});


app.get('/create-tournament', isLoggedIn, requireRole('Organizator'), function(req, res){
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
app.get('/tournament-details/:_id', isLoggedIn, function(req, res){

  var enlistedInTournament = false;
  var eligibleForTournament = false;

  User.find( {_id: req.user._id}, function(err, players){
    var ids = players.map(function(player){
      return player._id;
    });

    Tournament.findOne( { _id: req.params._id, players: {$in: ids}}, function(err, players){
      if(players){
        enlistedInTournament = true
        return enlistedInTournament;
      }
    });

    Tournament.findById(req.params._id).populate('players').populate('organizer').exec( function(err, tournament){
      if(err)
        res.send(err)
      else
        tournament.openForLeagues.leagues.forEach(function(league){
          if(req.user.local.league === league || league === 'Free for all'){
            eligibleForTournament = true;
            return eligibleForTournament;
          }
        });

        res.render('tournament/tournament-details.ejs',{
          user: req.user,
          tournament: tournament,
          moment: moment,
          enlistedInTournament: enlistedInTournament,
          eligibleForTournament: eligibleForTournament,
          procentajOcupare: (tournament.players.length * (100 / tournament.nrOfPlayers)) + '%'
        });
    });
  });
});

app.get('/signup-tournament/:_id/:_userId', isLoggedIn, function(req, res){

  Tournament.findById(req.params._id, function(err, tournament){
    if(err)
      res.send(err)
    else
      res.render('tournament/signup-tournament.ejs', {
        user: req.user,
        tournament: tournament,
        moment: moment
      });
  });
});

app.post('/signup-tournament/:_id/:userId', isLoggedIn, function(req, res){
  var playerId = req.params.userId;

  //TODO - incearca sa folosesti async.series([]) pentru a lega metoda de find si apoi inscirierea jucatorului in baza de date

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
              res.send(403);
            }else{
              Tournament.findByIdAndUpdate(req.params._id, {$pushAll: {
                players: [playerId]
              }}, function(err, tournament){
                if(err)
                  res.send(err)
                else
                  res.redirect('/user-tournaments/' + req.params.userId);
              });
            }
          }
        });
      }
    });
  });
});

app.get('/signup-tournament-result/:_id', isLoggedIn, function(req, res){
  res.render('tournament/signup-tournament-result.ejs', {
    user: req.user
  })
});

app.get('/user-tournaments/:_userId', isLoggedIn, function(req, res){
  User.find({_id: req.params._userId}, function(err, docs){
    var ids = docs.map(function(doc) {
      return doc._id;
    });

    Tournament.find( { players: {$in: ids} }).exec(function(err, playerTournaments){
      if(err)
        ErrorHandler.handle('A aparut o problema in extragerea turneelor in care esti inscris! ' + err);

      if(!playerTournaments)
        res.send('Nu am gasit niciun turneu in care esti inscris');
      else
        res.render('tournament/user-tournaments.ejs', {
          user: req.user,
          playerTournaments: playerTournaments,
          moment: moment,
          errorMessage: req.flash('infoError'),
          successMessage: req.flash('infoSuccess')
        });
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
          req.flash('infoSuccess', 'Te-ai retras cu succes din cadrul turneului!');

        res.redirect('/user-tournaments/' + req.params._userId);
      });
    }else{
      res.send(err);
    }
  });
});

app.get('/edit-tournament/:_tournamentId', isLoggedIn, requireRole('admin'), requireRole('Organizator'), function(req, res){

});

app.post('/edit-tournament/:_tournamentId', isLoggedIn, requireRole('admin'), requireRole('Organizator'), function(req, res){

});

app.post('/delete-tournament/:_tournamentId', isLoggedIn, requireRole('admin'), requireRole('Organizator'), function(req, res){

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

function getUserLeague(userLeague, league){
  if(userLeague === league){
    return true
  }

  return false;
}