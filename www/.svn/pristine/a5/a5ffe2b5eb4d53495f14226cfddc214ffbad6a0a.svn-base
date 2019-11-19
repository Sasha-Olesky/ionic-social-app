angular.module('starter.public', [])

.controller('publicCtrl', function($scope) {
	$scope.$on('$ionicView.beforeEnter', function() {
		$scope.$emit('child', true);		
	});
	$scope.$on('$stateChangeStart', function() {
		$scope.$emit('child', true);		
	});
});
