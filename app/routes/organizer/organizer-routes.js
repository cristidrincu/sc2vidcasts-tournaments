/**
 * Created by cristiandrincu on 10/2/14.
 */
var express = require('express');
var mongoose = require('mongoose');
var helperFunctions = require('../../../app/helpers-mongoose.js');
var User = require('../../../app/models/user');
var Tournament = require('../../../app/models/tournament');
var moment = require('moment');
var app = module.exports = express();
var _ = require('underscore');

app.get('/organizer-tournaments/:organizerId', isLoggedIn, requireRole('Organizator'), function(req, res){
	helperFunctions.getUserDetails(req.params.organizerId).then(function(user){
		helperFunctions.retrieveTournamentsByOrganizer(req.params.organizerId).then(function(organizerTournaments){
				res.render('backend/organizer-tournaments.ejs', {
					user: req.user,
					userAvatar: user,
					tournaments: _.filter(organizerTournaments, function(tournament){
						return tournament.finishedTournament == false;
					}),
					moment: moment
				});
		});
	});
});

app.get('/all-organizer-tournaments/:organizerId', isLoggedIn, requireRole('Organizator'), function(req, res){
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

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}

	res.redirect('/');
}

function requireRole(role){
	return function(req, res, next){
		if(req.user.local.role == role){
			next();
		}
		else{
			res.send(403);
		}
	}
}
