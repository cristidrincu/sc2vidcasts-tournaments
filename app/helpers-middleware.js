/**
 * Created by cristiandrincu on 2/20/15.
 */
/*ROUTE MIDDLEWARE AND OTHER UTILITY FUNCTIONS*/
var moment = require('moment');

exports.isLoggedIn = function(req, res, next){
	if (req.isAuthenticated()) {
		return next();
	}

	res.redirect('/');
}

exports.requireRole = function(role){
	return function(req, res, next){
		if(req.user.local.role === role){
			next();
		}
		else{
			res.send(403);
		}
	}
}

exports.requireMultipleUserRoles = function(role1, role2){
	return function(req, res, next){
		if(req.user.local.role === role1 || req.user.local.role === role2){
			next();
		}else{
			res.send(403);
		}
	}
}

exports.checkTournamentUpdatedProps = function(oldProp, updatedProp){
	if(oldProp == updatedProp){
		return 'Aceasta proprietate nu a fost modificata!' + '(' + oldProp + ')';
	}

	return updatedProp + '( a fost: ' + oldProp + ')';
}

exports.checkEmptyStartHour = function(editStartHour){
	var emptyStartHour = false;
	if(editStartHour == undefined || editStartHour == null || editStartHour == ''){
		emptyStartHour = true;
	}

	return emptyStartHour;
}

exports.checkEmptyLeagues = function(leagues){
	var emptyLeagues = false;
	if(leagues == undefined || leagues == null){
		emptyLeagues = true;
	}

	return emptyLeagues;
}

exports.uppercaseFirstChar = function(text){
	return text[0].toUpperCase() + text.slice(1);
}

exports.tournamentStatus = function(tournament){
	var date = new Date();
	var completed = 2;
	var ongoing = 1;
	var starting = 0;

	if(moment(date).isAfter(tournament.endDate)){
		return completed;
	}else if(moment(date).isAfter(tournament.startDate) && moment(date).isBefore(tournament.endDate) ){
		return ongoing;
	}else{
		return starting;
	}
}

exports.preventIllegalActions = function(reqUserId, reqParamsUserId){
	if(reqUserId != reqParamsUserId){
		return false;
	}

	return true;
}

exports.isUpdatedLeagueInTournamentLeaguesArray = function(updatedLeague, tournamentLeaguesArray, cb){
	var result;
	if(tournamentLeaguesArray.indexOf(updatedLeague) >= 0){
		result = true;
	}else{
		result = false;
	}

	cb(result);
}