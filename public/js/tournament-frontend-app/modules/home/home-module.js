/**
 * Created by cristiandrincu on 2/28/15.
 */
angular.module('tournaments.homeModule', ['tournaments.home.controllers', 'tournaments.home.services', 'tournaments.home.directives', 'ui.router'])
.config(['$stateProvider', function($stateProvider){
		$stateProvider.state('home', {
			url: '/acasa',
			templateUrl: 'js/tournament-frontend-app/modules/home/views/home.ejs',
			controller: 'HomeController'
		})
	}])