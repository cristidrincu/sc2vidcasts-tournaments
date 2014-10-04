/**
 * Created by cristiandrincu on 9/4/14.
 */
var express = require('express');
var Tournament = require('../../models/tournament');
var moment = require('moment');
var helperFunctions = require('../../../app/helpers-mongoose.js');

var app = module.exports = express();

var retrievedTournaments = null;
var retrievedPlayers = null;

helperFunctions.retrieveAllTournaments(function(tournaments){
  retrievedTournaments = tournaments;
});

helperFunctions.retrieveAllPlayers(function(players){
  retrievedPlayers = players;
});

/*BACK-END ROUTES*/
app.get('/backend-admin/:adminId', isLoggedIn, requireRole('admin'), function(req, res){
  helperFunctions.getUserDetails(req.params.adminId, function(user){
    helperFunctions.retrieveAllPlayers(function(players){
      res.render('backend/backend-admin.ejs', {
        user: req.user,
        userAvatar: user,
        players: players
      });
    });
  });
});

app.get('/backend-organizer/:organizerId', isLoggedIn, requireRole('Organizator'), function(req, res){
	helperFunctions.getUserDetails(req.params.organizerId, function(user){
		helperFunctions.retrieveTournamentsByOrganizer(req.params.organizerId, function(tournaments){
			checkAvatarArrayLength(function(){
				if(user.local.avatar.length == 0){
					helperFunctions.getDefaultAvatar(function(defaultAvatar){
						helperFunctions.setAvatarForUser(req.params.organizerId, defaultAvatar._id, function(err, user){
							if(err){
								throw new err;
							}
							res.render('backend/backend-organizer.ejs', {
								user: req.user,
								userAvatar: user,
								tournaments: tournaments,
								moment: moment
							});
						});
					});
				}else{
					res.render('backend/backend-organizer.ejs', {
						user: req.user,
						userAvatar: user,
						tournaments: tournaments,
						moment: moment
					});
				}
			});
		});
	});
});

app.get('/backend-user/:userId', isLoggedIn, function(req, res){
	helperFunctions.getUserDetails(req.params.userId, function(user){
		helperFunctions.retrieveAllTournaments(function(tournaments){
			checkAvatarArrayLength(function(){
				if(user.local.avatar.length == 0){
					helperFunctions.getDefaultAvatar(function(defaultAvatar){
						helperFunctions.setAvatarForUser(req.params.userId, defaultAvatar._id, function(err, user){
							if(err){
								throw new err;
							}
							res.render('backend/backend-user.ejs', {
								user: req.user,
								userAvatar: user,
								tournaments: tournaments,
								moment: moment
							});
						});
					});
				}else{
					res.render('backend/backend-user.ejs', {
						user: req.user,
						userAvatar: user,
						tournaments: tournaments,
						moment: moment
					});
				}
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

function requireRole(role){
  return function(req, res, next){
    if(req.user.local.role === role){
      next();
    }
    else{
      res.send(403);
    }
  }
}

function checkAvatarArrayLength(cb){
	cb();
}