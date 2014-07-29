/**
 * Created by cristiandrincu on 7/28/14.
 */

//pass the routes to our app, as well as to passport
module.exports = function(app, passport){

  app.get('/', function(req, res){
    res.render('index.ejs');
  });

  app.get('/login', function(req, res){
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  //process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  app.get('/signup', function(req, res){
      res.render('signup.ejs', { message: req.flash('signupMessage')} );
  });

  //process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  //PROFILE SELECTION
  // we will want this protected so you have to be logged in to visit
  // we will use route middleware to verify this (the isLoggedIn function)
  app.get('/profile', isLoggedIn, function(req, res){
    res.render('profile.ejs', {
      message: req.flash('signupSuccess'), //get the message out of the session and pass to template
      user: req.user//get the user out of session and pass to template
    });
  });

  //LOGOUT
  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

};

//route middleware to make sure a user is logged in
function isLoggedIn(req, res, next){
  //if user is authenticated in the session, carry on
  if(req.isAuthenticated()){
    return next();
  }

  //if they aren't, redirect them to homepage
  res.redirect('/');
}