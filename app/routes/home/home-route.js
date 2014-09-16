/**
 * Created by cristiandrincu on 9/2/14.
 */

//this is an app, we can call it in server.js in the following way
//var login = require('./app/routes/login/login-route)
//then mount it using app.use(login);

var express = require('express');
var app = module.exports=express();

app.get('/', function (req, res) {
  res.render('landing-page-index.ejs', {
    user: null
  });
});
