var LocalStrategy = require('passport-local').Strategy;
var mongoose = ('mongoose');
var utils = require('../utils/utils.js');

// load up the user model
var User = require('../app/models/user');

// expose this function to our app using module.exports
module.exports = function (passport) {

  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
      },
      function (req, email, password, done) {
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function () {

          // find a user whose email is the same as the forms email
          // we are checking to see if the user trying to create an account already exists
          User.findOne({ 'local.email': email }, function (err, user) {
            if (err)
              return done(err);

            if (user) {
              return done(null, false, req.flash('signupMessage', email + ' : Aceasta adresa de email este deja luata!'));
            } else {
		          //validate the email - if email is not valid, redirect to signup form
	            if(!utils.validateEmail(email)){
		            return done(null, false, req.flash('signupMessage', email + ' : Adresa de email nu este una valabila! '));
	            }

	            //validate battlenet id - if valid, save it
	            if(!utils.validateBNetId(req.body.battlenetid)){
		            var battlenetId = req.body.battlenetid;
		            return done(null, false, req.flash('bnetMessage', battlenetId + ' : ID-ul pentru Battlenet nu este valid!'));
	            }

              // if there is no user with that email
              // create the user
              var newUser = new User();

	            if(req.body.password == req.body.PasswordAgain){
		            newUser.local.password = newUser.generateHash(password);
	            }else{
		            return done(null, false, req.flash('signupMessage', 'Parolele nu sunt identice!'));
	            }

              // set the user's local credentials
              newUser.local.email = email;
              newUser.local.race = req.body.race;
              newUser.local.league = req.body.league;
              newUser.local.nickname = req.body.nickname;
              newUser.local.battlenetid = req.body.battlenetid;
              newUser.local.role = req.body.role;
              newUser.local.website = req.body.website;
	            newUser.local.avatar[0] = req.body.defaultAvatar;

              // save the user
              newUser.save(function (err) {
                if (err)
                  throw err;
                return done(null, newUser, req.flash('signupSuccess', 'Contul a fost creat cu succes!'));
              });
            }
          });
        });
      }));

  passport.use('local-login', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  }, function(req, email, password, done){
    //find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    User.findOne({ 'local.email' :  email }, function(err, user) {
      // if there are any errors, return the error before anything else
      if (err)
        return done(err);

      // if no user is found, return the message
      if (!user)
        return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

      // if the user is found but the password is wrong
      if (!user.isValid(password))
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

      // all is well, return successful user
      return done(null, user);
    });
  }));
};
