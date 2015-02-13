/**
 * Created by cristiandrincu on 9/4/14.
 */
var express = require('express');
var passport = require('passport');
var app = module.exports = express();

/*SIGN-UP ROUTES*/
app.get('/signup', function (req, res) {
  res.render('signup.ejs', { message: req.flash('signupMessage'), messageBNet: req.flash('bnetMessage'), user: null});
});

app.post('/signup', passport.authenticate('local-signup', {
	successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true // allow flash messages
}));
