/**
 * Created by cristiandrincu on 2/22/15.
 */
angular.module('tournaments.organizersModule', ['tournaments.organizers.services', 'tournaments.controllers.organizers', 'ui.router'])
	.config(['$stateProvider', function($stateProvider){
		$stateProvider.state('organizers', {
			url: '/organizatori',
			templateUrl: 'js/tournament-frontend-app/modules/organizers/views/organizers.ejs'
		})
	}])
