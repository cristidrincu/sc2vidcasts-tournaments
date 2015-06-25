/**
 * Created by cristiandrincu on 9/4/14.
 */

var express = require('express');
var app = module.exports = express();

/* LOGOUT ROUTE */
app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});
