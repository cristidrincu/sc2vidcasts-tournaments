/**
 * Created by cristiandrincu on 9/4/14.
 */
var express = require('express');
var Tournament = require('../../models/tournament');
var moment = require('moment');
var helperFunctions = require('../../../app/helpers-mongoose.js');
var middleware = require('../../helpers-middleware.js');
var _ = require('underscore');

var app = module.exports = express();

app.get('/backend-user/:userId', middleware.isLoggedIn, function(req, res){
	helperFunctions.getUserDetails(req.params.userId).then(function(user){
		helperFunctions.retrieveAllTournaments().then(function(tournaments){
			helperFunctions.retrieveAllPlayers().then(function(players){
				helperFunctions.retrieveAllOrganizers().then(function(organizers){
						helperFunctions.retrieveMessagesForUser(req.params.userId).then(function(messages){
							helperFunctions.retrieveAvatars().then(function(avatars){
								helperFunctions.retrieveQuotes().then(function(quotes){
									res.render('backend/backend-user.ejs', {
										user: req.user,
										userAvatar: user,
										playersLength: _.size(players),
										playersSampled: _.sample(players, 3),
										organizersLength: _.size(organizers),
										organizersSampled: _.sample(organizers, 3),
										tournamentsLength: _.size(tournaments),
										tournamentsSampled: _.sample(tournaments, 3),
										quoteSampled: _.sample(quotes, 1),
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
});

/*BACK-END ROUTES*/
app.get('/backend-admin/:adminId', middleware.isLoggedIn, middleware.requireRole('admin'), function(req, res){
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

app.get('/backend-organizer/:organizerId', middleware.isLoggedIn, middleware.requireRole('Organizator'), function(req, res){
	helperFunctions.getUserDetails(req.params.organizerId).then(function(user){
		helperFunctions.retrieveTournamentsByOrganizer(req.params.organizerId).then(function(tournaments){
			helperFunctions.retrieveQuotes().then(function(quotes){
				helperFunctions.retrieveAvatars().then(function(avatars){
					helperFunctions.retrieveAllPlayers().then(function(players){
						helperFunctions.retrieveMessagesForUser(req.params.organizerId).then(function(messages){
							helperFunctions.retrieveAllOrganizers().then(function(organizers){
								res.render('backend/backend-organizer.ejs', {
									user: req.user,
									userAvatar: user,
									tournaments: tournaments,
									moment: moment,
									tournamentsLength: _.size(tournaments),
									tournamentsSampled: _.sample(tournaments, 3),
									quoteSampled: _.sample(quotes, 1),
									avatarsLength: _.size(avatars),
									avatarsSampled: _.sample(avatars, 3),
									playersLength: _.size(players),
									playersSampled: _.sample(players, 3),
									messages: messages,
									organizersLength: _.size(organizers),
									organizersSampled: _.sample(organizers, 3)
								});
							});
						});
					});
				});
			});
		});
	});
});