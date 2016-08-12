/**
 * Created by cristiandrincu on 9/4/14.
 */
var express = require('express');
var passport = require('passport');
var app = module.exports = express();

var pageElements = (function() {
    var pvRaces,
        pvLeagues,
        pvRoles,
        pvFilteredRaces,
        pvFilteredLeagues,
        pvFilteredRoles;

    pvRaces = ['Terran', 'Zerg', 'Protoss'];
    pvLeagues = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grand Master'];
    pvRoles = ['User', 'Organizator'];
    pvFilteredRaces = function(userRace) {
        return pvRaces.filter(function(race) {
            return race !== userRace;
        });
    };

    pvFilteredLeagues = function(userLeague) {
        return pvLeagues.filter(function(league) {
            return league !== userLeague;
        });
    };

    pvFilteredRoles = function(userRole) {
        return pvRoles.filter(function(role) {
            return role !== userRole;
        });
    };

    return {
        races: pvRaces,
        leagues: pvLeagues,
        roles: pvRoles,
        filteredRaces: pvFilteredRaces,
        filteredLeagues: pvFilteredLeagues,
        filteredRoles: pvFilteredRoles
    };
}());

/*SIGN-UP ROUTES*/
app.get('/signup', function (req, res) {
  res.render('signup.ejs', {
      messages: req.flash('error'),
      //this gets used in the signup page when there are errors(messages), so the form fields get repopulated with previous values entered by the user
      previousFormValues: req.session.userCompletedFormValues,
      user: null,
      pageElements: pageElements
  });
});

app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true // allow flash messages
}));
