var LocalStrategy = require('passport-local').Strategy;
var mongoose = ('mongoose');
var utils = require('../utils/utils.js');
var helperValidateUser = require('../app/helpers/helpers-validate-login-signup.js');
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

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, email, password, done) {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to create an account already exists
            helperValidateUser.onSignup(email, done, req, password);
        }));

    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    }, function (req, email, password, done) {
        //find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        helperValidateUser.onLogin(email, done, req, password);
    }));
};
