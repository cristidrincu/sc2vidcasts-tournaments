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
var app = module.exports = express();

app.get('/admin-organizers/:userId', isLoggedIn, requireRole('admin'), function(req, res){
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

app.get('/organized-tournaments/:organizerId', isLoggedIn, requireRole('admin'), function(req, res){
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

//app.get('/admin-tournaments/:tournamentId/:userId', isLoggedIn, requireRole('admin'), function(req,res){
//  Tournament.findById(req.params.tournamentId).populate('players').populate('organizer').exec( function(err, tournament){
//    if(err)
//      res.send(err)
//    else
//    helperFunctions.getUserDetails(req.params.userId).then(function(user){
//	    res.render('tournament/tournament-details-admin.ejs',{
//		    user: req.user,
//		    userAvatar: user,
//		    tournament: tournament,
//		    procentajOcupare: (tournament.players.length * (100 / tournament.nrOfPlayers)) + '%',
//		    moment: moment
//	    });
//    });
//  });
//});

app.get('/avatars-users-admin/:adminId', isLoggedIn, requireRole('admin'), function(req, res){
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

app.post('/delete-account/:userId', isLoggedIn, requireRole('admin'), function(req, res){

  Tournament.collection.update(
      { tournamentName: 'Battle of the Races' },
      { $pull: { 'players': { _id: new mongoose.Types.ObjectId(req.params.userId) } } },
      { multi: true },
      function(err, result){
        if(err) throw  err;
        console.log(result);
      }
  );

  res.redirect('/admin-players');
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