/**
 * Created by cristiandrincu on 2/22/15.
 */
angular.module('tournaments.players.services', [])
	.factory('Players', function($http){
		return {
			getPlayers: function(){
				return $http.get('/api/players').then(function(result){
					return result.data;
				});
			}
		}
	});
