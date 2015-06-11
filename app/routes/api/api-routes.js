/**
 * Created by cristiandrincu on 2/19/15.
 */
var express = require('express');
var helperFunctions = require('../../../app/helpers-mongoose.js');
var moment = require('moment');
var _  = require('underscore');

var app = module.exports = express();

app.get('/api/v1/tournaments', function(req, res){
	helperFunctions.retrieveAllTournaments().then(function(tournaments){
		res.json(tournaments);
	});
});

app.get('/api/v1/players', function(req, res){
	helperFunctions.retrieveAllPlayers().then(function(players){
		res.json(players);
	});
});

app.get('/api/v1/organizers', function(req, res){
	helperFunctions.retrieveAllOrganizers().then(function(organizers){
		res.json(organizers);
	});
});

app.get('/api/v1/tournaments-by-organizer/:organizerId', function(req, res){
	helperFunctions.retrieveTournamentsByOrganizer(req.params.organizerId).then(function(tournaments){
		res.json(tournaments);
	});
});

app.get('/api/v1/upcoming-tournaments', function(req, res){
	helperFunctions.retrieveAllTournaments().then(function(tournaments){
		var upcoming = _.filter(tournaments, function(tournament){
			return tournament.finishedTournament === false;
		});

		res.json(upcoming);
	});
});