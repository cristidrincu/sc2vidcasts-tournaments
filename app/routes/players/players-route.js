/**
 * Created by cristiandrincu on 9/4/14.
 */
require('q');
var express = require('express');
var _ = require('underscore');

var helperFunctions = require('../../helpers/helpers-mongoose.js');
var middleware = require('../../helpers/helpers-middleware.js');

var app = module.exports = express();

/*PLAYER ROUTES*/
/*PLAYER ROUTES FOR LEAGUE RESULTS - GOLD PLAYERS, SILVER PLAYERS ETC*/
app.get('/players/:userId', middleware.isLoggedIn, function(req, res){
	helperFunctions.getUserDetails(req.params.userId).then(function(user){
		helperFunctions.retrieveAllPlayers().then(function(players){
			res.render('players/all-players.ejs', {
				user: req.user,
				avatarUser: user,
				userId: req.params.userId,
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
