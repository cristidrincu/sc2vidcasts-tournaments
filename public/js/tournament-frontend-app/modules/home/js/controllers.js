/**
 * Created by cristiandrincu on 2/28/15.
 */
angular.module('tournaments.home.controllers', [])
.controller('HomeController', ['$scope', 'ServicesHomePage', function($scope, ServicesHomePage){
		$scope.loadingProjects = true;
		ServicesHomePage.getPlayerNumbers().then(function(players){
			$scope.loadingProjects = false;
			$scope.playerNumbers = players.length;
		})

		ServicesHomePage.getActiveTournaments().then(function(tournaments){
			$scope.loadingProjects = false;
			$scope.activeTournaments = tournaments.length;
		})

		ServicesHomePage.getOrganizers().then(function(organizers){
			$scope.loadingProjects = false;
			$scope.organizers = organizers.length;
		})
	}])