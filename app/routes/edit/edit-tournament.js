/**
 * Created by cristiandrincu on 10/10/14.
 */
var express = require('express');
var helperFunctions = require('../../../app/helpers-mongoose.js');
var User = require('../../../app/models/user');
var Tournament = require('../../../app/models/tournament');
var moment = require('moment');
var _  = require('underscore');

var app = module.exports = express();

app.get('/edit-tournament/:tournamentId/:userId', function(req, res){
	helperFunctions.retrieveTournamentDetails(req.params.tournamentId, req.params.userId).then(function(tournament){
		res.render('tournament/edit/edit-tournament-basic-info.ejs', {
			user: req.user,
			tournament: tournament
		});
	});
});
