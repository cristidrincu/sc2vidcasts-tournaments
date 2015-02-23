/**
 * Created by cristiandrincu on 2/22/15.
 */
angular.module('tournaments.organizers.services', [])
	.factory('Organizers', function($http){
		return {
			getOrganizers: function(){
				return $http.get('/api/organizers').then(function(result){
					return result.data;
				})
			}
		}
});