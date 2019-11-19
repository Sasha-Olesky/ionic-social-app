angular.module('starter.alert', [])
.controller('AlertCtrl', function($scope,$state,$ionicLoading,Session,APIManager,$rootScope){   
	
	$ionicLoading.show();
	var url = 'notify';
	var data = {userid:Session.getSession('user').id,page:1};
	APIManager.get(url, data).then(function(res) {
		if(res.data != '')
			$scope.notify_items = res.data.notify_items;
			//$scope.received_items = res.data.received_items;
		$ionicLoading.hide();
		$scope.more = res.data.is_more;
	});
	Session.saveHistory();
    $scope.navBack = function(){
		if($rootScope.goBack)
			$state.go($scope.goBack);
		else
			Session.goBack();
    };
	
	$scope.doNotifyRefresh = function(){
		$scope.page = 1;
		var url = 'notify';
		var data = {userid:Session.getSession('user').id,page:1};
		APIManager.get(url, data).then(function(res) {
			if(res.data != '')
				$scope.notify_items = res.data.notify_items;
				//$scope.received_items = res.data.received_items;
			$scope.$broadcast('scroll.refreshComplete');
			$ionicLoading.hide();
			$scope.more = res.data.is_more;
		});
	};
});