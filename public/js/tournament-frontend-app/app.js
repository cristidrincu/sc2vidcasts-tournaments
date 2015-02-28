/**
 * Created by cristiandrincu on 2/22/15.
 */
angular.module('tournament-frontend-app', ['tournaments.homeModule', 'tournaments.aboutModule', 'tournaments.playersModule', 'tournaments.organizersModule'])
.run(['$state', function($state){
		$state.go('home');
}])