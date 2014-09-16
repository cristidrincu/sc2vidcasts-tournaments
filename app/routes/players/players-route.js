/**
 * Created by cristiandrincu on 9/4/14.
 */
var express = require('express');
var helperFunctions = require('../../../app/helpers-mongoose.js');
var app = module.exports = express();

var retrievedTournaments = null;
helperFunctions.retrieveAllTournaments(function(tournaments){
  retrievedTournaments = tournaments;
});

/*PLAYER ROUTES*/
/*PLAYER ROUTES FOR LEAGUE RESULTS - GOLD PLAYERS, SILVER PLAYERS ETC*/
app.get('/jucatori-liga-bronze', isLoggedIn, function(req, res){
  helperFunctions.retrieveBronzePlayers(function(jucatoriBronze){
    res.render('players/leagues/jucatori-liga-bronze.ejs', {
      user: req.user,
      tournaments: retrievedTournaments,
      bronzePlayers: jucatoriBronze
    })
  })
});

app.get('/jucatori-liga-silver', isLoggedIn, function(req, res){
  helperFunctions.retrieveSilverPlayers(function(jucatoriSilver){
    res.render('players/leagues/jucatori-liga-silver.ejs', {
      user: req.user,
      tournaments: retrievedTournaments,
      silverPlayers: jucatoriSilver
    })
  })
});

app.get('/jucatori-liga-gold', isLoggedIn, function(req, res){
  helperFunctions.retrieveGoldPlayers(function(jucatoriGold){
    res.render('players/leagues/jucatori-liga-gold.ejs', {
      user: req.user,
      tournaments: retrievedTournaments,
      goldPlayers: jucatoriGold
    })
  })
});

app.get('/jucatori-liga-platinum', isLoggedIn, function(req, res){
  helperFunctions.retrievePlatinumPlayers(function(jucatoriPlatinum){
    res.render('players/leagues/jucatori-liga-platinum.ejs', {
      user: req.user,
      tournaments: retrievedTournaments,
      platinumPlayers: jucatoriPlatinum
    })
  })
});

app.get('/jucatori-liga-diamond', isLoggedIn, function(req, res){
  helperFunctions.retrieveDiamondPlayers(function(jucatoriDiamond){
    res.render('players/leagues/jucatori-liga-diamond.ejs', {
      user: req.user,
      tournaments: retrievedTournaments,
      diamondPlayers: jucatoriDiamond
    })
  })
});

app.get('/jucatori-liga-master', isLoggedIn, function(req, res){
  helperFunctions.retrieveMasterPlayers(function(jucatoriMaster){
    res.render('players/leagues/jucatori-liga-master.ejs', {
      user: req.user,
      tournaments: retrievedTournaments,
      masterPlayers: jucatoriMaster
    })
  })
});

app.get('/jucatori-liga-grand-master', isLoggedIn, function(req, res){
  helperFunctions.retrieveGMPlayers(function(jucatoriGM){
    res.render('players/leagues/jucatori-liga-grand-master.ejs', {
      user: req.user,
      tournaments: retrievedTournaments,
      jucatoriGM: jucatoriGM
    });
  });
});

/*ROUTE MIDDLEWARE - MAKE SURE A USER IS LOGGED IN*/
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
}
