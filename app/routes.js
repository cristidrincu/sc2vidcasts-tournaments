/**
 * Created by cristiandrincu on 7/28/14.
 */

var User = require('./models/user');
var Tournament = require('./models/tournament');

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
  }), function(req, res){
    res.redirect('/backend-user');
  });

  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage'), user: null});
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true // allow flash messages
  }));

  //PROFILE SELECTION
  // we will want this protected so you have to be logged in to visit
  // we will use route middleware to verify this (the isLoggedIn function)
  app.get('/profile', isLoggedIn, function (req, res) {
    res.render('profile.ejs', {
      message: req.flash('signupSuccess'), //get the message out of the session and pass to template
      user: req.user, //get the user out of session and pass to template
    });
  });

  app.get('/backend-user', isLoggedIn, function(req, res){
    res.render('backend-user.ejs', {
      user: req.user
    });
  });

  //UPDATE PROFILE - get template
  app.get('/customize-profile:nickname', isLoggedIn, function(req, res){
    res.render('customize-profile.ejs', {
      user: req.user//get the user out of session and pass to template
    });
  });

  //UPDATE PROFILE - post
  app.post('/customize-profile:nickname', function(req, res){
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
  app.get('/tournaments', function(req, res){
    res.render('backend-user.ejs', {
      tournament: req.tournament
    });
  });

  app.get('/create-tournament', isLoggedIn, function(req, res){
    res.render('create-tournament.ejs', {
      user: req.user
    });
  });

  app.get('/create-tournament-results', isLoggedIn, function(req, res){
    res.render('create-tournament-results.ejs', {
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
        newTournament.tournament.tournamentName = req.body.tournamentName;
        newTournament.tournament.nrOfPlayers = req.body.nrOfPlayers;
        newTournament.tournament.edition = req.body.edition;
        newTournament.tournament.description = req.body.description;
        newTournament.tournament.startDate = req.body.startDate;
        newTournament.tournament.endDate = req.body.endDate;
        newTournament.tournament.startHour = req.body.startHour;
        newTournament.tournament.prize = req.body.prize;
        newTournament.tournament.sponsors = req.body.sponsors;

        newTournament.save(function(err){
          if(err)
              req.flash('infoError', 'A aparut o eroare la creearea turneului. Mai incearca!');
          else
              req.flash('infoSuccess', 'Turneul a fost creat cu succes!');

          res.redirect('/create-tournament-results');
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