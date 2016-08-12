var Tournament = require('../../models/tournament');
var User = require('../../models/user');
var Avatar = require('../../models/avatar');
var TournamentNotificationMessages = require('../../helpers/helpers-tournament-error-messages.js');
var moment = require('moment');
var placeHolderText = require('../../../config/validation-placeholders-text.js');
var _ = require('underscore');
var helperFunctions = require('../helpers-mongoose.js');

exports.allTournaments = function() {
    helperFunctions.retrieveAllTournaments().then(function (tournaments) {
        return tournaments;
    });
};
