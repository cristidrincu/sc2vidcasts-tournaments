/**
 * Created by cristiandrincu on 10/2/14.
 */
var express = require('express');
var mongoose = require('mongoose');
var User = require('../../../app/models/user');
var Tournament = require('../../../app/models/tournament');
var moment = require('moment');
var app = module.exports = express();
var _ = require('underscore');

var helperFunctions = require('../../helpers/helpers-mongoose.js');
var middleware = require('../../helpers/helpers-middleware.js');

app.get('/organizer-tournaments/:organizerId', middleware.isLoggedIn, middleware.requireRole('Organizator'), function(req, res){
	helperFunctions.getUserDetails(req.params.organizerId).then(function(user){
		helperFunctions.retrieveTournamentsByOrganizer(req.params.organizerId).then(function(organizerTournaments){
				res.render('backend/organizer-tournaments.ejs', {
					user: req.user,
					userAvatar: user,
					tournaments: _.filter(organizerTournaments, function(tournament){
						return tournament.finishedTournament === false;
					}),
					moment: moment
				});
		});
	});
});

app.get('/all-organizer-tournaments/:organizerId', middleware.isLoggedIn, middleware.requireRole('Organizator'), function(req, res){
	helperFunctions.getUserDetails(req.params.organizerId).then(function(user){
		helperFunctions.retrieveTournamentsByOrganizer(req.params.organizerId).then(function(organizerTournaments){
			res.render('backend/organizer-tournaments.ejs', {
				user: req.user,
				userAvatar: user,
				tournaments: organizerTournaments,
				moment: moment
			});
		});
	});
});

app.get('/organizers', middleware.isLoggedIn, function(req, res){
	helperFunctions.getUserDetails(req.user._id).then(function(user){
		helperFunctions.retrieveAllOrganizers().then(function(organizers){
			res.render('backend/organizers.ejs', {
				user: user,
				userAvatar: user,
				organizers: organizers
			});
		});
	});
});
