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

app.get('/admin-players/:userId', isLoggedIn, requireRole('admin'), function(req, res){
  helperFunctions.getUserDetails(req.params.userId, function(user){
    helperFunctions.retrieveAllPlayers().then(function(players){
      res.render('backend/admin-players.ejs', {
        user: req.user,
        players: players,
        avatarUser: user,
        errorDeleteAccountMessage: req.flash('infoError'),
        successDeleteAccountMessage: req.flash('infoSuccess')
      });
    });
  });
});

app.get('/admin-organizers/:userId', isLoggedIn, requireRole('admin'), function(req, res){
  helperFunctions.getUserDetails(req.params.userId, function(user){
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
  helperFunctions.retrieveTournamentsByOrganizer(req.params.organizerId, function(tournamentsOrganized){
      helperFunctions.getUserDetails(req.params.organizerId, function(organizer){
        res.render('backend/tournaments-by-organizer.ejs', {
          user: req.user,
          organizer: organizer,
          organizedTournaments: tournamentsOrganized,
          moment: moment
        });
    });
  });
});

app.get('/admin-tournaments/:tournamentId/:userId', isLoggedIn, requireRole('admin'), function(req,res){
  Tournament.findById(req.params.tournamentId).populate('players').populate('organizer').exec( function(err, tournament){
    if(err)
      res.send(err)
    else
    helperFunctions.getUserDetails(req.params.userId, function(user){
	    res.render('tournament/tournament-details-admin.ejs',{
		    user: req.user,
		    userAvatar: user,
		    tournament: tournament,
		    procentajOcupare: (tournament.players.length * (100 / tournament.nrOfPlayers)) + '%',
		    moment: moment
	    });
    });
  });
});

app.get('/avatars-users-admin/:adminId', isLoggedIn, requireRole('admin'), function(req, res){
  helperFunctions.getUserDetails(req.params.adminId, function(user){
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

//  User.remove({ _id: req.params.userId}, function(err){
//    if(err){
//      req.flash('infoError', 'A aparut o eroare la stergerea utilizatorului!');
//    }else{
//      req.flash('infoSuccess', 'Contul a fost sters cu success!');
//    }
//
//  })

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