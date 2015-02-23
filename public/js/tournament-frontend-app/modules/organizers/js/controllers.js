/**
 * Created by cristiandrincu on 2/22/15.
 */
angular.module('tournaments.controllers.organizers', [])
	.controller('OrganizersController', ['$scope', 'Organizers', function($scope, Organizers){
			Organizers.getOrganizers().then(function(data){
				$scope.organizersPresent = data.length;

				$scope.organizers = data;
			})
	}])