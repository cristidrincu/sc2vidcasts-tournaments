/**
 * Created by cristiandrincu on 2/22/15.
 */
angular.module('tournaments.tournamentsModule', ['tournaments.openTournaments.controllers', 'tournaments.services', 'ui.router'])
.config(['$stateProvider', function($stateProvider){
		$stateProvider.state('tournaments', {
			url: '/turnee',
			templateUrl: 'js/tournament-frontend-app/modules/tournaments/views/tournaments.ejs'
		})
	}])