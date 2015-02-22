/**
 * Created by cristiandrincu on 2/22/15.
 */
angular.module('tournaments.players.controllers', [])
	.controller('PlayersController', ['$scope', 'Players', function($scope, Players){

		Players.getPlayers().then(function(data){
			$scope.players = data;

			$scope.bronzePlayers = _.filter(data, function(player){
				return player.local.league == 'Bronze';
			});

			$scope.silverPlayers = _.filter(data, function(player){
				return player.local.league == 'Silver';
			});

			$scope.goldPlayers = _.filter(data, function(player){
				return player.local.league == 'Gold';
			});

			$scope.platinumPlayers = _.filter(data, function(player){
				return player.local.league == 'Silver';
			});

			$scope.diamondPlayers = _.filter(data, function(player){
				return player.local.league == 'Diamond';
			});

			$scope.mastersPlayers = _.filter(data, function(player){
				return player.local.league == 'Master';
			});

			$scope.grandMasterPlayers = _.filter(data, function(player){
				return player.local.league == 'Grand Master';
			});
		});
	}]);