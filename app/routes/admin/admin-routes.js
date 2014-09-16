/**
 * Created by cristiandrincu on 9/10/14.
 */
var express = require('express');
var helperFunctions = require('../../../app/helpers-mongoose.js');
var User = require('../../../app/models/user');
var Tournament = require('../../../app/models/tournament');
var moment = require('moment');
var app = module.exports = express();

var retrievedTournaments = null;
helperFunctions.retrieveAllTournaments(function(tournaments){
  retrievedTournaments = tournaments;
});

app.get('/admin-players', function(req, res){
  res.render('backend/admin-players', {
    user: req.user,
    tournaments: retrievedTournaments
  });
});

app.get('/admin-organizers', function(req, res){
  res.render('backend/admin-organizers.ejs', {
    user: req.user,
    tournaments: retrievedTournaments
  });
});

app.get('/admin-tournaments/:_id', function(req,res){
  Tournament.findById(req.params._id).populate('players').populate('organizer').exec( function(err, tournament){
    if(err)
      res.send(err)
    else
      res.render('tournament/tournament-details-admin.ejs',{
        user: req.user,
        tournament: tournament,
        tournaments: retrievedTournaments,
        moment: moment
      });
  });
});
