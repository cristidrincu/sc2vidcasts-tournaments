/**
 * Created by cristiandrincu on 3/23/15.
 */
angular.module('tournaments.home.services', [])
	.factory('ServicesHomePage', function($http){
		return {
			getPlayerNumbers: function(){
				return $http.get('/api/players').then(function(result){
					return result.data;
				});
			},
			getActiveTournaments: function(){
				return $http.get('/api/upcoming-tournaments').then(function(result){
					return result.data;
				})
			},
			getOrganizers: function(){
				return $http.get('/api/organizers').then(function(result){
					return result.data;
				})
			}
		}
	})