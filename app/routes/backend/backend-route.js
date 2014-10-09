/**
 * Created by cristiandrincu on 9/4/14.
 */
var express = require('express');
var Tournament = require('../../models/tournament');
var moment = require('moment');
var helperFunctions = require('../../../app/helpers-mongoose.js');
var _ = require('underscore');

var app = module.exports = express();

app.get('/backend-user/:userId', isLoggedIn, function(req, res){
	helperFunctions.getUserDetails(req.params.userId).then(function(user){
		helperFunctions.retrieveAllTournaments().then(function(tournaments){
			checkAvatarArrayLength(function(){
				if(user.local.avatar.length == 0){
					helperFunctions.getDefaultAvatar().then(function(defaultAvatar){
						helperFunctions.setAvatarForUser(req.params.userId, defaultAvatar._id).then(function(err, user){
							if(err){
								throw new err;
							}
							helperFunctions.retrieveAllPlayers().then(function(players){
								helperFunctions.retrieveAllOrganizers().then(function(organizers){
										helperFunctions.retrieveMessagesForUser(req.params.adminId).then(function(messages){
											helperFunctions.retrieveAvatars().then(function(avatars){
												res.render('backend/backend-user.ejs', {
													user: req.user,
													userAvatar: user,
													playersLength: _.size(players),
													playersSampled: _.sample(players, 3),
													organizersLength: _.size(organizers),
													organizersSampled: _.sample(organizers, 3),
													tournamentsLength: _.size(tournaments),
													tournamentsSampled: _.sample(tournaments, 3),
													messages: messages,
													avatarsLength: _.size(avatars),
													avatarsSampled: _.sample(avatars, 3)
												});
											});
										});
									});
								});
							});
						});
				}else{
					helperFunctions.retrieveAllPlayers().then(function(players){
						helperFunctions.retrieveAllOrganizers().then(function(organizers){
								helperFunctions.retrieveMessagesForUser(req.params.adminId).then(function(messages){
									helperFunctions.retrieveAvatars().then(function(avatars){
										res.render('backend/backend-user.ejs', {
											user: req.user,
											userAvatar: user,
											playersLength: _.size(players),
											playersSampled: _.sample(players, 3),
											organizersLength: _.size(organizers),
											organizersSampled: _.sample(organizers, 3),
											tournamentsLength: _.size(tournaments),
											tournamentsSampled: _.sample(tournaments, 3),
											messages: messages,
											avatarsLength: _.size(avatars),
											avatarsSampled: _.sample(avatars, 3)
										});
									});
								});
							});
						});
				}
			});
		});
	});
});

/*BACK-END ROUTES*/
app.get('/backend-admin/:adminId', isLoggedIn, requireRole('admin'), function(req, res){
  helperFunctions.getUserDetails(req.params.adminId).then(function(user){
    helperFunctions.retrieveAllPlayers().then(function(players){
	    helperFunctions.retrieveAllOrganizers().then(function(organizers){
		    helperFunctions.retrieveAllTournaments().then(function(tournaments){
			    helperFunctions.retrieveMessagesForUser(req.params.adminId).then(function(messages){
				    helperFunctions.retrieveAvatars().then(function(avatars){
					    res.render('backend/backend-admin.ejs', {
						    user: req.user,
						    userAvatar: user,
						    playersLength: _.size(players),
						    playersSampled: _.sample(players, 3),
						    organizersLength: _.size(organizers),
						    organizersSampled: _.sample(organizers, 3),
						    tournamentsLength: _.size(tournaments),
						    tournamentsSampled: _.sample(tournaments, 3),
						    messages: messages,
						    avatarsLength: _.size(avatars),
						    avatarsSampled: _.sample(avatars, 3)
					    });
				    });
			    });
		    });
	    });
    });
  });
});

app.get('/backend-organizer/:organizerId', isLoggedIn, requireRole('Organizator'), function(req, res){
	helperFunctions.getUserDetails(req.params.organizerId).then(function(user){
		helperFunctions.retrieveTournamentsByOrganizer(req.params.organizerId).then(function(tournaments){
			checkAvatarArrayLength(function(){
				if(user.local.avatar.length == 0){
					helperFunctions.getDefaultAvatar().then(function(defaultAvatar){
						helperFunctions.setAvatarForUser(req.params.organizerId, defaultAvatar._id).then(function(err, user){
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