/**
 * Created by cristiandrincu on 3/2/15.
 */
angular.module('tournaments.partnersModule', ['ui.router'])
	.config(['$stateProvider', function($stateProvider){
		$stateProvider.state('partners', {
			url: '/parteneri',
			templateUrl: 'js/tournament-frontend-app/modules/partners/views/partners.ejs'
		});
	}])