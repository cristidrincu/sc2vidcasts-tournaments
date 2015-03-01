angular.module('tournaments.services', [])
	.factory('Tournaments', ['$http', function($http){
		return {
			getActiveTournaments: function(){
				return $http.get('/api/upcoming-tournaments').then(function(result){
					return result.data;
				})
			}
		}
	}])
