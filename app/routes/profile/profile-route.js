/**
 * Created by cristiandrincu on 9/4/14.
 */
var express = require('express');
var moment = require('moment');
var helperFunctions = require('../../../app/helpers-mongoose.js');
var User = require('../../../app/models/user');
var _ = require('underscore');
var app = module.exports = express();

/* PROFILE ROUTES */
app.get('/profile', isLoggedIn, function (req, res) {
  helperFunctions.getUserDetails(req.user._id).then(function(user){
	  helperFunctions.retrieveMessagesForUser(req.user._id).then(function(messages){
		  res.render('profile/profile.ejs', {
			  message: req.flash('signupSuccess'), //get the message out of the session and pass to template
			  user: req.user, //get the user out of session and pass to template - you get id, email and password
			  userAvatar: user.local.avatar,
			  detailedUser: user,
			  moment: moment,
			  messages: messages
		  });
	  });
	});
});


app.get('/profile-details/:_id', isLoggedIn, function(req, res){
  helperFunctions.getUserDetails(req.params._id).then(function(user){
    res.render('profile/profile-details.ejs', {
      user: req.user,
      detailedUser: user,
	    userAvatar: user
    });
  });
});

app.get('/customize-profile/:nickname', isLoggedIn, function(req, res){
  res.render('profile/customize-profile.ejs', {
    user: req.user//get the user out of session and pass to template
  });
});

app.post('/customize-profile/:nickname', isLoggedIn, function(req, res){
  User.findOne({ 'local.nickname': req.params.nickname}, function(err, user){
    if(err)
      res.send('Utilizatorul nu a putut fi gasit');

    user = req.user;
    user.local.email = req.body.email;
    user.local.nickname = req.body.nickname;
    user.local.race = uppercaseFirstChar(req.body.race);
    user.local.league = uppercaseFirstChar(req.body.league);

    user.save(function(err){
      if(err)
        res.send('failed to update user');

      res.redirect('/profile');
    });
  });
});

app.get('/avatars-users/:userId', isLoggedIn, function(req, res){
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

app.get('/delete-account/:userId', isLoggedIn, function(req, res){
	helperFunctions.getUserDetails(req.params.userId).then(function(user){
		res.render('profile/profile-remove', {
			user: user,
			userAvatar: user
		});
	});
});

app.post('/delete-account/:userId', isLoggedIn, function(req, res){
	User.findById(req.params.userId).exec(function(err, user){
		if(err) throw err;

		user.remove();

		res.redirect('/signup');
	});
});

/*ROUTE MIDDLEWARE - MAKE SURE A USER IS LOGGED IN*/
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
}

function uppercaseFirstChar(text){
  return text[0].toUpperCase() + text.slice(1);
}

function defaultAvatarUser(arrayUserAvatar, userId){
	if(arrayUserAvatar == 0){
		helperFunctions.getDefaultAvatar().then(function(defaultAvatar){
			helperFunctions.setAvatarForUser(userId, defaultAvatar._id).then(function(err, defaultUser){
				if(err){
					throw new err;
				}

				return defaultUser;
			});
		});
	}
}