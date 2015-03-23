/**
 * Created by cristiandrincu on 3/23/15.
 */
angular.module('tournaments.home.directives', [])
	.directive('contentLoading', function(){
		return {
			restrict: 'A',
			replace: true,
			transclude: true,
			scope: {
				loading: '=contentLoading'
			},
			templateUrl: 'js/tournament-frontend-app/modules/home/views/loading.html',
			link: function(scope, element, attrs){
				var spinner = new Spinner().spin();
				var loadingContainer = element.find('.my-loading-spinner-container')[0];
				loadingContainer.appendChild(spinner.el);
			}
		}
	})