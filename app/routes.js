/**
 * Created by cristiandrincu on 7/28/14.
 */

var User = require('./models/user');
var Tournament = require('./models/tournament');
var moment = require('moment');
var mongoose = require('mongoose');

//pass the routes to our app, as well as to passport
module.exports = function (app, passport) {

  app.get('/', function (req, res) {
    res.render('index.ejs', {
      user: null
    });
  });

  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage'), user: null});
  });

  app.post('/login', passport.authenticate('local-login', {
    failureRedirect: '/login',
    failureFlash: true
  }), function(req, res, user){
    user = req.user;
    switch (user.local.role){
      case 'admin':
        res.redirect('/backend-admin');
      break;
      case 'User':
        res.redirect('/backend-user');
      break;
      case 'Organizator':
        res.redirect('/backend-organizer');
      break;
    }

  });

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
        res.redirect('/backend-admin');
        break;
      case 'User':
        res.redirect('/backend-user');
        break;
      case 'Organizator':
        res.redirect('/backend-organizer');
        break;
    }
  });

  //PROFILE SELECTION
  // we will want this protected so you have to be logged in to visit
  // we will use route middleware to verify this (the isLoggedIn function)
  app.get('/profile', isLoggedIn, function (req, res) {
    res.render('profile/profile.ejs', {
      message: req.flash('signupSuccess'), //get the message out of the session and pass to template
      user: req.user, //get the user out of session and pass to template
    });
  });

  app.get('/backend-admin', isLoggedIn, function(req, res){
      res.render('backend/backend-admin.ejs', {
        user: req.user
      });
  });

  app.get('/backend-organizer', isLoggedIn, function(req, res){
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

  //UPDATE PROFILE - get template
  app.get('/customize-profile/:nickname', isLoggedIn, function(req, res){
    res.render('profile/customize-profile.ejs', {
      user: req.user//get the user out of session and pass to template
    });
  });

  //UPDATE PROFILE - post
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

  //LOGOUT
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });


  ///////// - TOURNAMENT ROUTES- //////////
  app.get('/create-tournament', isLoggedIn, function(req, res){
    res.render('tournament/create-tournament.ejs', {
      user: req.user
    });
  });

  app.get('/create-tournament-results', isLoggedIn, function(req, res){
    res.render('tournament/create-tournament-results.ejs', {
      user: req.user,
      errorMessage: req.flash('infoError'),
      successMessage: req.flash('infoSuccess')
    });
  });

  app.post('/create-tournament', isLoggedIn, function(req, res){

    Tournament.findOne({ 'tournament.edition': req.body.edition, 'tournament.tournamentName' : req.body.tournamentName }, function(err, newTournament){
      if(newTournament)
          req.flash('infoError', 'O editie a acestui turneu exista deja')
      else
        newTournament = new Tournament();
        newTournament.tournamentName = req.body.tournamentName;
        newTournament.nrOfPlayers = req.body.nrOfPlayers;
        newTournament.edition = req.body.edition;
        newTournament.description = req.body.description;
        newTournament.startDate = req.body.startDate;
        newTournament.endDate = req.body.endDate;
        newTournament.startHour = req.body.startHour;
        newTournament.prize = req.body.prize;
        newTournament.sponsors = req.body.sponsors;

        newTournament.save(function(err){
          if(err)
              req.flash('infoError', 'A aparut o eroare la creearea turneului. Mai incearca!');
          else
              req.flash('infoSuccess', 'Turneul a fost creat cu succes!');

          res.redirect('/create-tournament-results');
      });
    });
  });

  app.get('/tournament-details/:_id', isLoggedIn, function(req, res){
//    var id = mongoose.Types.ObjectId(req.params._id);
    Tournament.findById(req.params._id, function(err, tournament){
      if(err)
        res.send(err)
      else
        res.render('tournament/tournament-details.ejs', {
          user: req.user,
          tournament: tournament
        });
    });
  });
  //////// - END TOURNAMENT ROUTES - //////
};

//route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  //if user is authenticated in the session, carry on
  if (req.isAuthenticated()) {
    return next();
  }

  //if they aren't, redirect them to homepage
  res.redirect('/');
}

function uppercaseFirstChar(text){
  return text[0].toUpperCase() + text.slice(1);
}