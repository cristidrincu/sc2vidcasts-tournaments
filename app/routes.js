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

//  ), function(req, res, user){
//    user = req.user;
//    switch (user.local.role){
//      case 'admin':
//        res.redirect('/backend-admin');
//        break;
//      case 'User':
//        res.redirect('/backend-user');
//        break;
//      case 'Organizator':
//        res.redirect('/backend-organizer');
//        break;
//    }


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
  app.get('/backend-admin', requireRoleAdmin('admin'), function(req, res){
      res.render('backend/backend-admin.ejs', {
        user: req.user
      });
  });

  app.get('/backend-organizer', requireRoleOrganizator('Organizator'), requireRoleAdmin('admin'), function(req, res){
    res.render('backend/backend-organizer.ejs', {
      user: req.user
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
  app.get('/profile', function (req, res) {
    res.render('profile/profile.ejs', {
      message: req.flash('signupSuccess'), //get the message out of the session and pass to template
      user: req.user //get the user out of session and pass to template
    });
  });

  app.get('/profile-details/:_id', function(req, res){
    helperFunctions.getUserDetails(req.params._id, function(user){
      res.render('profile/profile-details.ejs', {
        user: req.user,
        tournaments: retrievedTournaments,
        detailedUser: user
      });
    });
  });

  app.get('/customize-profile/:nickname', function(req, res){
    res.render('profile/customize-profile.ejs', {
      user: req.user//get the user out of session and pass to template
    });
  });

  app.post('/customize-profile/:nickname', function(req, res){
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
  app.get('/send-message/:_id', function(req, res){
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

  app.post('/send-message/:_id', function(req, res){
    var message = new Message( {messageBody: req.body.message, messageSubject: req.body.messageSubject, sentBy: req.user, receiver: req.params._id} );
    message.save(function(err){
      if(err)
        ErrorHandler.handle('A aparut o eroare la trimiterea mesajului' + err);
      else
        res.redirect('/backend-user');
    });
  });

  app.get('/user-messages', function(req, res){
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

  /* TOURNAMENT ROUTES */
  app.get('/create-tournament', function(req, res){
    res.render('tournament/create-tournament.ejs', {
      user: req.user
    });
  });

  app.get('/create-tournament-results', function(req, res){
    res.render('tournament/create-tournament-results.ejs', {
      user: req.user,
      errorMessage: req.flash('infoError'),
      successMessage: req.flash('infoSuccess')
    });
  });

  app.post('/create-tournament', function(req, res){

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

    Tournament.findById(req.params._id).populate('players').exec( function(err, tournament){
      if(err)
        res.send(err)
      else
        res.render('tournament/tournament-details.ejs',{
          user: req.user,
          tournament: tournament,
          tournaments: retrievedTournaments,
          moment: moment
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
          tournaments: retrievedTournaments,
          moment: moment
        });
    });
  });

  app.post('/signup-tournament/:_id/:userId', isLoggedIn, function(req, res){
    var playerId = req.params.userId;

    //TODO - incearca sa folosesti async.series([]) pentru a lega metoda de find si apoi insrierea jucatorului in baza de date
    if(validateObjectId(req.params._id) && validateObjectId(req.params.userId)){
      User.find({_id: req.params.userId}, function(err, docs){
        var ids = docs.map(function(doc) {
          return doc._id;
        });

        Tournament.find( {players: {$in: ids}}, function(err, docs){
          if(err){
            res.send('no player found');
          }

          if(docs){
            //TODO - replace with proper error view - present other tournaments that the user can enlist into
            res.send('Esti deja inscris in cadrul acestui turneu!');
          }else if(!docs){
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
                      res.redirect('/signup-tournament/' + req.params._id + '/' + req.params.userId);
                  });
                }
              }
            });
          }
        });
      });
    }
  });

  app.get('/signup-tournament-result/:_id', isLoggedIn, function(req, res){
    res.render('tournament/signup-tournament-result.ejs', {
      user: req.user
    })
  });

  /*PLAYER ROUTES*/
  app.get('/jucatori-terran', function(req, res){
    helperFunctions.retrieveTerranPlayers(function(terrans){
      res.render('players/jucatori-terran.ejs', {
        user: req.user,
        tournaments: retrievedTournaments,
        terranPlayers: terrans
      });
    });
  });

  app.get('/jucatori-zerg', function(req, res){
    helperFunctions.retrieveZergPlayers(function(zergs){
      res.render('players/jucatori-zerg.ejs', {
        user: req.user,
        tournaments: retrievedTournaments,
        zergPlayers: zergs
      });
    });
  });

  app.get('/jucatori-protoss', function(req, res){
    helperFunctions.retrieveProtossPlayers(function(protosses){
      res.render('players/jucatori-protoss.ejs', {
        user: req.user,
        tournaments: retrievedTournaments,
        protossPlayers: protosses
      });
    });
  });

  /*PLAYER ROUTES FOR LEAGUE RESULTS - GOLD PLAYERS, SILVER PLAYERS ETC*/
  app.get('/jucatori-liga-bronze', function(req, res){
    helperFunctions.retrieveBronzePlayers(function(jucatoriBronze){
      res.render('players/leagues/jucatori-liga-bronze.ejs', {
        user: req.user,
        tournaments: retrievedTournaments,
        bronzePlayers: jucatoriBronze
      })
    })
  });

  app.get('/jucatori-liga-silver', function(req, res){
    helperFunctions.retrieveSilverPlayers(function(jucatoriSilver){
      res.render('players/leagues/jucatori-liga-silver.ejs', {
        user: req.user,
        tournaments: retrievedTournaments,
        silverPlayers: jucatoriSilver
      })
    })
  });

  app.get('/jucatori-liga-gold', function(req, res){
    helperFunctions.retrieveGoldPlayers(function(jucatoriGold){
      res.render('players/leagues/jucatori-liga-gold.ejs', {
        user: req.user,
        tournaments: retrievedTournaments,
        goldPlayers: jucatoriGold
      })
    })
  });

  app.get('/jucatori-liga-platinum', function(req, res){
    helperFunctions.retrievePlatinumPlayers(function(jucatoriPlatinum){
      res.render('players/leagues/jucatori-liga-platinum.ejs', {
        user: req.user,
        tournaments: retrievedTournaments,
        platinumPlayers: jucatoriPlatinum
      })
    })
  });

  app.get('/jucatori-liga-diamond', function(req, res){
    helperFunctions.retrieveDiamondPlayers(function(jucatoriDiamond){
      res.render('players/leagues/jucatori-liga-diamond.ejs', {
        user: req.user,
        tournaments: retrievedTournaments,
        diamondPlayers: jucatoriDiamond
      })
    })
  });

  app.get('/jucatori-liga-master', function(req, res){
    helperFunctions.retrieveMasterPlayers(function(jucatoriMaster){
      res.render('players/leagues/jucatori-liga-master.ejs', {
        user: req.user,
        tournaments: retrievedTournaments,
        masterPlayers: jucatoriMaster
      })
    })
  });

  app.get('/jucatori-liga-grand-master', function(req, res){
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

function requireRoleOrganizator(role){
  return function(req, res, next){
    if(req.session.user && req.session.user.local.role === role){
      next();
    }
    else{
      res.send(403);
    }
  }
}

function requireRoleAdmin(role){
  return function(req, res, next){
    if(req.session.user && req.session.user.local.role === role){
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
