/**
 * Created by cristiandrincu on 9/4/14.
 */
var express = require('express');
var helperFunctions = require('../../../app/helpers-mongoose.js');
var app = module.exports = express();

/*PLAYER ROUTES*/
/*PLAYER ROUTES FOR LEAGUE RESULTS - GOLD PLAYERS, SILVER PLAYERS ETC*/
app.get('/players/:userId', isLoggedIn, function(req, res){
	helperFunctions.getUserDetails(req.params.userId, function(user){
		helperFunctions.retrieveBronzePlayers(req.params.userId, function(bronzePlayers){
			//TODO - implementeaza filtrarea pe toate colectiile de jucator, astfel incat sa dispara din acele colectii jucatorul care este momentan logat
			helperFunctions.retrieveSilverPlayers(function(silverPlayers){
				helperFunctions.retrieveGoldPlayers(function(goldPlayers){
					helperFunctions.retrievePlatinumPlayers(function(platPlayers){
						helperFunctions.retrieveDiamondPlayers(function(diamondPlayers){
							helperFunctions.retrieveMasterPlayers(function(masterPlayers){
								helperFunctions.retrieveGMPlayers(function(gmPlayers){
									res.render('players/all-players.ejs', {
										user: req.user,
										avatarUser: user,
										bronzePlayers: bronzePlayers,
										silverPlayers: silverPlayers,
										goldPlayers: goldPlayers,
										platPlayers: platPlayers,
										diamondPlayers: diamondPlayers,
										masterPlayers: masterPlayers,
										gmPlayers: gmPlayers
									});
								});
							});
						})
					});
				});
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
