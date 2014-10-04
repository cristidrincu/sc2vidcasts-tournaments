/**
 * Created by cristiandrincu on 9/4/14.
 */
var express = require('express');
var passport = require('passport');
var app = module.exports=express();

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
      res.redirect('/backend-admin/' + req.user._id);
      break;
    case 'User':
      res.redirect('/backend-user/' + req.user._id);
      break;
    case 'Organizator':
      res.redirect('/backend-organizer/' + req.user._id);
      break;
  }
});