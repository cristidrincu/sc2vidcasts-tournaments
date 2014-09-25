/**
 * Created by cristiandrincu on 9/2/14.
 */

    //this is an app, we can call it in server.js in the following way
    //var login = require('./app/routes/login/login-route)
    //then mount it using app.use(login);

var express = require('express');
var passport = require('passport');
var app = module.exports=express();

app.get('/login', function (req, res) {
  res.render('login.ejs', { message: req.flash('loginMessage'), user: null});
});

app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile/',
  failureRedirect: '/login',
  failureFlash: true
}));
