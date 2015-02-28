/**
 * Created by cristiandrincu on 2/22/15.
 */
angular.module('tournaments.playersModule', ['tournaments.players.services', 'tournaments.players.controllers', 'ui.router'])
.config(['$stateProvider', function($stateProvider){
	$stateProvider.state('players', {
		url: '/detalii-jucatori-inscrisi',
		templateUrl: 'js/tournament-frontend-app/modules/players/views/players.ejs'
	})
}])