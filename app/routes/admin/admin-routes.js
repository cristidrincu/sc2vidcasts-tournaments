/**
 * Created by cristiandrincu on 9/10/14.
 */
var express = require('express');
var mongoose = require('mongoose');
var helperFunctions = require('../../../app/helpers-mongoose.js');
var User = require('../../../app/models/user');
var Tournament = require('../../../app/models/tournament');
var moment = require('moment');
var _  = require('underscore');
var middleware = require('../../helpers-middleware.js');
var app = module.exports = express();

app.get('/admin-organizers/:userId', middleware.isLoggedIn, middleware.requireRole('admin'), function(req, res){
  helperFunctions.getUserDetails(req.params.userId).then(function(user){
    helperFunctions.retrieveTournamentsAndOrganizers(function(tournaments, organizers){
      res.render('backend/admin-organizers.ejs', {
        user: req.user,
        tournaments: tournaments,
        avatarUser: user,
        organizers: organizers,
        errorDeleteAccountMessage: req.flash('infoError'),
        successDeleteAccountMessage: req.flash('infoSuccess')
      });
    });
  });
});

app.get('/organized-tournaments/:organizerId', middleware.isLoggedIn, middleware.requireRole('admin'), function(req, res){
  helperFunctions.retrieveTournamentsByOrganizer(req.params.organizerId).then(function(tournamentsOrganized){
	  helperFunctions.getUserDetails(req.user._id).then(function(user){
		  helperFunctions.getUserDetails(req.params.organizerId).then(function(organizer){
			  res.render('backend/tournaments-by-organizer.ejs', {
				  user: req.user,
				  avatarUser: user,
				  organizer: organizer,
				  organizedTournaments: tournamentsOrganized,
				  moment: moment
			  });
		  });
	  });
  });
});

app.get('/avatars-users-admin/:adminId', middleware.isLoggedIn, middleware.requireRole('admin'), function(req, res){
  helperFunctions.getUserDetails(req.params.adminId).then(function(user){
		helperFunctions.retrieveAvatars().then(function(avatars){
			res.render('avatars/avatars-users-admin.ejs', {
				user: req.user,
				userAvatar: user,
				terranAvatars: _.filter(avatars, function(avatar){
					if(avatar.imageRaceCategory === 'terran'){
						return avatar;
					}
				}),
				zergAvatars: _.filter(avatars, function(avatar){
					if(avatar.imageRaceCategory === 'zerg'){
						return avatar;
					}
				}),
				protossAvatars: _.filter(avatars, function(avatar){
					if(avatar.imageRaceCategory === 'protoss'){
						return avatar;
					}
				})
			});
		});
	});
});

app.post('/delete-account/:userId', middleware.isLoggedIn, middleware.requireRole('admin'), function(req, res){

	//There is a pre-remove function for the deletion of a user account in app/models/user.js
	User.remove({_id: req.params.userId}, function(err, result){
		if(err) throw err;
	});

  res.redirect('/admin-players');
});