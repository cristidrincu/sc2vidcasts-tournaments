/**
 * Created by cristiandrincu on 9/10/14.
 */
var express = require('express');
var helperFunctions = require('../../../app/helpers-mongoose.js');
var User = require('../../../app/models/user');
var Tournament = require('../../../app/models/tournament');
var moment = require('moment');
var app = module.exports = express();

app.get('/admin-players', function(req, res){

  helperFunctions.retrieveAllPlayers(function(players, tournaments){
    res.render('backend/admin-players.ejs', {
      user: req.user,
      players: players,
      errorDeleteAccountMessage: req.flash('infoError'),
      successDeleteAccountMessage: req.flash('infoSuccess')
    });
  });
});

app.get('/admin-organizers', function(req, res){
  helperFunctions.retrieveTournamentsAndOrganizers(function(tournaments, organizers){
    res.render('backend/admin-organizers.ejs', {
      user: req.user,
      tournaments: tournaments,
      organizers: organizers,
      errorDeleteAccountMessage: req.flash('infoError'),
      successDeleteAccountMessage: req.flash('infoSuccess')
    });
  });
});

app.get('/organized-tournaments/:organizerId', function(req, res){
  helperFunctions.retrieveTournamentsByOrganizer(req.params.organizerId, function(tournamentsOrganized){
      helperFunctions.getUserDetails(req.params.organizerId, function(organizer){
        res.render('backend/tournaments-by-organizer.ejs', {
          user: req.user,
          organizer: organizer,
          organizedTournaments: tournamentsOrganized,
          moment: moment
        });
    });
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
        procentajOcupare: (tournament.players.length * (100 / tournament.nrOfPlayers)) + '%',
        moment: moment
      });
  });
});

app.post('/delete-account/:userId', function(req, res){
  User.remove({ _id: req.params.userId}, function(err){
    if(err){
      req.flash('infoError', 'A aparut o eroare la stergerea utilizatorului!');
    }else{
      req.flash('infoSuccess', 'Contul a fost sters cu success!');
    }

    res.redirect('/admin-players');
  })
});