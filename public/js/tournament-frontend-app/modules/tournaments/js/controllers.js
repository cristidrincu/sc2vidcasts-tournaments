/**
 * Created by cristiandrincu on 2/22/15.
 */
angular.module('tournaments.openTournaments.controllers', []).
	controller('OpenTournamentsController', ['$scope', 'Tournaments', function($scope, Tournaments){
		Tournaments.getActiveTournaments().then(function(tournaments){
			$scope.activeTournaments = tournaments.length;
		})
	}]);