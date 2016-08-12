/**
 * Created by cristiandrincu on 3/2/15.
 */
angular.module('tournaments.contactModule', ['ui.router'])
	.config(['$stateProvider', function($stateProvider){
		$stateProvider.state('contact', {
			url: '/contact-us',
			templateUrl: 'js/tournament-frontend-app/modules/contact/views/contact.ejs'
		})
	}])
