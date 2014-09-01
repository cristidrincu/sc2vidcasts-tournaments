/**
 * Created by cristiandrincu on 7/28/14.
 */

/*HELPER FUNCTIONS FOR MONGOOSE QUERIES*/
var retrievedTournaments = null;

/*MODELS AND OTHER MODULES*/
var User = require('./models/user');
var Tournament = require('./models/tournament');
var Message = require('./models/message');

var moment = require('moment');
var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var helperFunctions = require('./helpers-mongoose.js');
var async = require('async');
var ErrorHandler = require('./helpers-error-handlers.js');

module.exports = function (app, passport) {

  /*RULES FOR ACCESS*/
  app.all('/profile/*', isLoggedIn);
  app.all('/customize-profile/*', isLoggedIn);

      helperFunctions.retrieveAllTournaments(function(tournaments){
        retrievedTournaments = tournaments;
      });

  /*HOME AND LOGIN ROUTES*/
  app.get('/', function (req, res) {
    res.render('landing-page-index.ejs', {
      user: null
    });
  });

  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage'), user: null});
  });

  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }));

  /*SIGN-UP ROUTES*/
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage'), user: null});
  });

  app.post('/signup', passport.authenticate('local-signup', {
    failureRedirect: '/signup',
    failureFlash: true // allow flash messages
  }), function(req, res, user){
    user = req.user;
    switch (user.local.role){
      case 'admin':
        res.redirect('/backend-admin/');
        break;
      case 'User':
        res.redirect('/backend-user');
        break;
      case 'Organizator':
        res.redirect('/backend-organizer/');
        break;
    }
  });

  /*BACK-END ROUTES*/
  app.get('/backend-admin', requireRole('admin'), function(req, res){
      res.render('backend/backend-admin.ejs', {
        user: req.user,
        tournaments: retrievedTournaments
      });
  });

  app.get('/backend-organizer', requireRole('Organizator'), function(req, res){
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

  /* PROFILE ROUTES */
  app.get('/profile', isLoggedIn, function (req, res) {
    res.render('profile/profile.ejs', {
      message: req.flash('signupSuccess'), //get the message out of the session and pass to template
      user: req.user //get the user out of session and pass to template
    });
  });

  app.get('/profile-details/:_id', isLoggedIn, function(req, res){
    helperFunctions.getUserDetails(req.params._id, function(user){
      res.render('profile/profile-details.ejs', {
        user: req.user,
        tournaments: retrievedTournaments,
        detailedUser: user
      });
    });
  });

  app.get('/customize-profile/:nickname', isLoggedIn, function(req, res){
    res.render('profile/customize-profile.ejs', {
      user: req.user//get the user out of session and pass to template
    });
  });

  app.post('/customize-profile/:nickname', isLoggedIn, function(req, res){
    User.findOne({ 'local.nickname': req.params.nickname}, function(err, user){
      if(err)
        res.send('Utilizatorul nu a putut fi gasit');

      user = req.user;
      user.local.email = req.body.email;
      user.local.nickname = req.body.nickname;
      user.local.race = uppercaseFirstChar(req.body.race);
      user.local.league = uppercaseFirstChar(req.body.league);

      user.save(function(err){
        if(err)
          res.send('failed to update user');

        res.redirect('/profile');
      });
    });
  });

  /*MESSAGING ROUTES*/
  app.get('/send-message/:_id', isLoggedIn, function(req, res){
    User.findById(req.params._id, function(err, user){
      if(err)
        ErrorHandler.handle('Nu a fost gasit un jucator cu acest ID ' + err)
      else
        var retrievedPlayer = user;
        res.render('messaging/send-message.ejs', {
          user: req.user,
          tournaments: retrievedTournaments,
          player: retrievedPlayer
        })
      });
  });

  app.get('/send-reply/:_receiverId/:_messageId', isLoggedIn, function(req, res){
    Message.findById(req.params._messageId).exec(function(err, messages){
      if(err)
        ErrorHandler.handle('A aparut o eroare la extragerea mesajului din baza de date ' + err);
      else
        res.render('messaging/send-reply.ejs', {
          user: req.user,
          tournaments: retrievedTournaments,
          messages: messages,
          receiverId: req.params._receiverId
        });
    });
  });

  /*TODO - UPDATE the message that is being sent as a reply instead of creating a new one - create a POST method for send-reply*/

  app.post('/send-message/:_id', isLoggedIn, function(req, res){
    var message = new Message( {messageBody: req.body.message, messageSubject: req.body.messageSubject, sentBy: req.user, receiver: req.params._id} );
    message.save(function(err){
      if(err)
        ErrorHandler.handle('A aparut o eroare la trimiterea mesajului' + err);
      else
        res.redirect('/backend-user');
    });
  });

  app.get('/user-messages', isLoggedIn, function(req, res){
    Message.find( {receiver: req.user._id}).populate('sentBy').exec(function(err, messages){
      if(err)
        ErrorHandler.handle('A intervenit o eroare la preluarea mesajelor din baza de date: ' + err);
      else
        res.render('messaging/messages.ejs', {
          user: req.user,
          tournaments: retrievedTournaments,
          messages: messages
        });
    });
  });

  app.get('/message-details/:_id', isLoggedIn, function(req, res){
    Message.findById(req.params._id).populate('sentBy').exec(function(err, message){
      if(err)
        ErrorHandler.handle('A aparut o eroare la extragerea mesajului din baza de date: ' + err);
      res.render('messaging/message-details.ejs', {
        user: req.user,
        tournaments: retrievedTournaments,
        messageDetails: message
      });
    });
  });

  app.post('/delete-message/:_id', isLoggedIn, function(req, res){
    Message.findById(req.params._id).remove(function(err){
      if(err)
        ErrorHandler.handle('A aparut o eroare la stergerea mesajului din baza de date: ' + err);
      else
        res.redirect('/user-messages');
    });
  });

  /* TOURNAMENT ROUTES */
  app.get('/create-tournament', isLoggedIn, requireRole('Organizator'), function(req, res){
    res.render('tournament/create-tournament.ejs', {
      user: req.user
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

    User.find( {_id: req.user._id}, function(err, players){
      var ids = players.map(function(player){
        return player._id;
      });

      Tournament.findOne( { _id: req.params._id, players: {$in: ids}}, function(err, players){
        if(players)
          enlistedInTournament = true
      });

      Tournament.findById(req.params._id).populate('players').exec( function(err, tournament){
        if(err)
          res.send(err)
        else
          res.render('tournament/tournament-details.ejs',{
            user: req.user,
            tournament: tournament,
            tournaments: retrievedTournaments,
            moment: moment,
            enlistedInTournament: enlistedInTournament
          });
      });
    });

//    helperFunctions.retrieveTournamentLeagues(req.params._id, function(leagues){
//      leagues.forEach(function(league){
//        //TODO - CHECK PLAYER LEAGUE AND PREVENT ENLISTING IN THE TOURNAMENT IF THE LEAGUE IS NOT PRESENT IN THE LEAGUES ARRAY FOR THE TOURNAMENT MODEL
//        if(league === 'Free for all'){
//
//        }else{
//          res.send('Nu te poti inscrie in cadrul acestui turneu!');
//        }
//      });
//    });
  });

  app.get('/signup-tournament/:_id/:_userId', isLoggedIn, function(req, res){

    Tournament.findById(req.params._id, function(err, tournament){
      if(err)
        res.send(err)
      else
        res.render('tournament/signup-tournament.ejs', {
          user: req.user,
          tournament: tournament,
          tournaments: retrievedTournaments,
          moment: moment
        });
    });
  });

  app.post('/signup-tournament/:_id/:userId', isLoggedIn, function(req, res){
    var playerId = req.params.userId;

    //TODO - incearca sa folosesti async.series([]) pentru a lega metoda de find si apoi insrierea jucatorului in baza de date

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
            tournaments: retrievedTournaments,
            playerTournaments: playerTournaments,
            moment: moment,
            errorMessage: req.flash('infoError'),
            successMessage: req.flash('infoSuccess')
          });
      });

    });
  });

  app.post('/retragere-din-turneu/:_userId/:_tournamentId', function(req, res){

    console.log(req.params._userId);
    console.log(req.params._tournamentId);

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

  /*PLAYER ROUTES*/
  /*PLAYER ROUTES FOR LEAGUE RESULTS - GOLD PLAYERS, SILVER PLAYERS ETC*/
  app.get('/jucatori-liga-bronze', isLoggedIn, function(req, res){
    helperFunctions.retrieveBronzePlayers(function(jucatoriBronze){
      res.render('players/leagues/jucatori-liga-bronze.ejs', {
        user: req.user,
        tournaments: retrievedTournaments,
        bronzePlayers: jucatoriBronze
      })
    })
  });

  app.get('/jucatori-liga-silver', isLoggedIn, function(req, res){
    helperFunctions.retrieveSilverPlayers(function(jucatoriSilver){
      res.render('players/leagues/jucatori-liga-silver.ejs', {
        user: req.user,
        tournaments: retrievedTournaments,
        silverPlayers: jucatoriSilver
      })
    })
  });

  app.get('/jucatori-liga-gold', isLoggedIn, function(req, res){
    helperFunctions.retrieveGoldPlayers(function(jucatoriGold){
      res.render('players/leagues/jucatori-liga-gold.ejs', {
        user: req.user,
        tournaments: retrievedTournaments,
        goldPlayers: jucatoriGold
      })
    })
  });

  app.get('/jucatori-liga-platinum', isLoggedIn, function(req, res){
    helperFunctions.retrievePlatinumPlayers(function(jucatoriPlatinum){
      res.render('players/leagues/jucatori-liga-platinum.ejs', {
        user: req.user,
        tournaments: retrievedTournaments,
        platinumPlayers: jucatoriPlatinum
      })
    })
  });

  app.get('/jucatori-liga-diamond', isLoggedIn, function(req, res){
    helperFunctions.retrieveDiamondPlayers(function(jucatoriDiamond){
      res.render('players/leagues/jucatori-liga-diamond.ejs', {
        user: req.user,
        tournaments: retrievedTournaments,
        diamondPlayers: jucatoriDiamond
      })
    })
  });

  app.get('/jucatori-liga-master', isLoggedIn, function(req, res){
    helperFunctions.retrieveMasterPlayers(function(jucatoriMaster){
      res.render('players/leagues/jucatori-liga-master.ejs', {
        user: req.user,
        tournaments: retrievedTournaments,
        masterPlayers: jucatoriMaster
      })
    })
  });

  app.get('/jucatori-liga-grand-master', isLoggedIn, function(req, res){
    helperFunctions.retrieveGMPlayers(function(jucatoriGM){
      res.render('players/leagues/jucatori-liga-grand-master.ejs', {
        user: req.user,
        tournaments: retrievedTournaments,
        jucatoriGM: jucatoriGM
      });
    });
  });

  /* LOGOUT ROUTE */
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });
};

/*ROUTE MIDDLEWARE - MAKE SURE A USER IS LOGGED IN*/
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
}

function uppercaseFirstChar(text){
  return text[0].toUpperCase() + text.slice(1);
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

function validateObjectId(param){
  if(ObjectId.isValid(param)){
    return true;
  }

  return false;
}
