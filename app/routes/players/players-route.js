/**
 * Created by cristiandrincu on 9/4/14.
 */
require('q');
var express = require('express');
var helperFunctions = require('../../../app/helpers-mongoose.js');
var _ = require('underscore');
var app = module.exports = express();

/*PLAYER ROUTES*/
/*PLAYER ROUTES FOR LEAGUE RESULTS - GOLD PLAYERS, SILVER PLAYERS ETC*/
app.get('/players/:userId', isLoggedIn, function(req, res){
	helperFunctions.getUserDetails(req.params.userId, function(user){
		helperFunctions.retrieveAllPlayers().then(function(players){
			res.render('players/all-players.ejs', {
				user: req.user,
				avatarUser: user,
				bronzePlayers: _.filter(players, function(player){
					if(player.local.league === 'Bronze'){
						return player;
					}
				}),
				silverPlayers: _.filter(players, function(player){
					if(player.local.league === 'Silver'){
						return player;
					}
				}),
				goldPlayers: _.filter(players, function(player){
					if(player.local.league === 'Gold'){
						return player;
					}
				}),
				platPlayers: _.filter(players, function(player){
					if(player.local.league === 'Platinum'){
						return player;
					}
				}),
				diamondPlayers: _.filter(players, function(player){
					if(player.local.league === 'Diamond'){
						return player;
					}
				}),
				masterPlayers: _.filter(players, function(player){
					if(player.local.league === 'Master'){
						return player;
					}
				}),
				gmPlayers: _.filter(players, function(player){
					if(player.local.league === 'Grand Master'){
						return player;
					}
				})
			});
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
