/**
 * Created by cristiandrincu on 3/23/15.
 */
angular.module('tournaments.home.services', [])
	.factory('ServicesHomePage', function($http){
		return {
			getPlayerNumbers: function(){
				return $http.get('/api/v1/players').then(function(result){
					return result.data;
				});
			},
			getActiveTournaments: function(){
				return $http.get('/api/v1/upcoming-tournaments').then(function(result){
					return result.data;
				})
			},
			getOrganizers: function(){
				return $http.get('/api/v1/organizers').then(function(result){
					return result.data;
				})
			}
		}
	})