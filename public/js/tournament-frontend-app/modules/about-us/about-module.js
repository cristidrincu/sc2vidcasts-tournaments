/**
 * Created by cristiandrincu on 2/28/15.
 */
angular.module('tournaments.aboutModule', ['tournaments.about.controllers', 'ui.router'])
.config(['$stateProvider', function($stateProvider){
	$stateProvider.state('about', {
		url: '/despre-noi',
		templateUrl: 'js/tournament-frontend-app/modules/about-us/views/about-us.ejs'
	})
}])