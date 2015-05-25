/**
 * Created by cristiandrincu on 10/26/14.
 */

var helperFunctions = require('./helpers-mongoose.js');
var _ = require('underscore');

exports.totalAvatars = function(){
	'use strict';
	helperFunctions.retrieveAvatars().then(function(avatars){
		return _.size(avatars);
	});
};

exports.totalPlayers = function(){
	helperFunctions.retrieveAllPlayers().then(function(players){
		return _.size(players);
	});
};
