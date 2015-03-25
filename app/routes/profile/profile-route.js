/**
 * Created by cristiandrincu on 9/4/14.
 */
var express = require('express');
var moment = require('moment');
var User = require('../../../app/models/user');
var _ = require('underscore');

var helperFunctions = require('../../helpers-mongoose.js');
var middleware = require('../../helpers-middleware.js');

var app = module.exports = express();

/* PROFILE ROUTES */
app.get('/profile', middleware.isLoggedIn, function (req, res) {
  helperFunctions.getUserDetails(req.user._id).then(function(user){
	  helperFunctions.retrieveMessagesForUser(req.user._id).then(function(messages){
		  helperFunctions.retrieveTournamentsByOrganizer(req.user._id).then(function(organizerTournaments){
			  helperFunctions.retrieveAllTournaments().then(function(tournamentsActive){
				  helperFunctions.checkTournamentsStatus(function(){
					  res.render('profile/profile.ejs', {
						  message: req.flash('signupSuccess'), //get the message out of the session and pass to template
						  user: req.user, //get the user out of session and pass to template - you get id, email and password
						  userAvatar: user.local.avatar,
						  detailedUser: user,
						  organizerTournaments: organizerTournaments,
						  tournamentsActive: tournamentsActive,
						  moment: moment,
						  messages: messages
					  });
				  });
				 });
			  });
		  });
	  });
});

app.get('/profile-details/:_id', middleware.isLoggedIn, function(req, res){
  helperFunctions.getUserDetails(req.params._id).then(function(user){
    res.render('profile/profile-details.ejs', {
      user: req.user,
      detailedUser: user,
	    userAvatar: user
    });
  });
});

app.get('/customize-profile/:nickname', middleware.isLoggedIn, function(req, res){
  res.render('profile/customize-profile.ejs', {
    user: req.user, //get the user out of session and pass to template
    races: _.without(['Terran', 'Zerg', 'Protoss'], req.user.local.race),
	  leagues: _.without(['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grand Master'], req.user.local.league)
  });
});

app.post('/customize-profile/:nickname', middleware.isLoggedIn, function(req, res){
  User.findOne({ 'local.nickname': req.params.nickname}, function(err, user){
    if(err)
      res.send('Utilizatorul nu a putut fi gasit');

    user = req.user;
    user.local.email = req.body.email;
    user.local.nickname = req.body.nickname;
    user.local.race = middleware.uppercaseFirstChar(req.body.race);
    user.local.league = middleware.uppercaseFirstChar(req.body.league);

    user.save(function(err){
      if(err)
        res.send('failed to update user');

      res.redirect('/profile');
    });
  });
});

app.get('/avatars-users/:userId', middleware.isLoggedIn, function(req, res){
	helperFunctions.getUserDetails(req.params.userId).then(function(user){
		helperFunctions.retrieveTournamentsByOrganizer(req.params.userId).then(function(tournaments){
			helperFunctions.retrieveAvatars().then(function(avatars){
				res.render('avatars/avatars-users.ejs', {
					user: req.user,
					avatarUser: user,
					avatarsLength: _.size(avatars),
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
});

app.get('/delete-account/:userId', middleware.isLoggedIn, function(req, res){
	if(!middleware.preventIllegalActions(req.user._id, req.params.userId)){
		res.render('error-pages/error-forbidden-403.ejs', {
			user: req.user
		});
	}else{
		helperFunctions.getUserDetails(req.params.userId).then(function(user){
			res.render('profile/profile-remove', {
				user: user,
				userAvatar: user
			});
		});
	}
});

app.post('/delete-account/:userId', middleware.isLoggedIn, function(req, res){
	User.remove( {_id: req.params.userId}, function(err, result){
		if(err) throw err
	})

	res.redirect('/signup');
});