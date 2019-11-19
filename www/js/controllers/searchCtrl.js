angular.module('starter.search', [])
.controller('SearchCtrl', function($scope, $rootScope, $ionicHistory, $timeout, $ionicPlatform, Session,$ionicLoading, APIManager, $ionicModal, $state){
    	
	$scope.go_state = function(state) {				
		$state.go(state);
	};
	
	$scope.conditions = {
		locations : [
			{value:'不限'},
			{value:'安徽'},
			{value:'中国澳门'},
			{value:'北京'},
			{value:'重庆'},
			{value:'福建'},
			{value:'广东'},
			{value:'甘肃'},
			{value:'广西'},
			{value:'贵州'},
			{value:'湖北'},
			{value:'河北'},
			{value:'黑龙江'},
			{value:'湖南'},
			{value:'河南'},
			{value:'海南'},
			{value:'吉林'},
			{value:'江苏'},
			{value:'江西'},
			{value:'辽宁'},
			{value:'内蒙古'},
			{value:'宁夏'},
			{value:'青海'},
			{value:'四川'},
			{value:'山东'},
			{value:'上海'},
			{value:'陕西'},
			{value:'山西'},
			{value:'天津'},
			{value:'中国台湾'},
			{value:'西藏'},
			{value:'中国香港'},
			{value:'新疆'},
			{value:'云南'},
			{value:'浙江'}
		],
		ages : {from_ages:[{label:'不限', value:0}], to_ages:[{label:'不限', value:0}]},
		statures : {from_statures:[{label:'不限', value:0}], to_statures:[]}
	}
	
	for(var i=18; i<=65; i++) {
		$scope.conditions.ages.from_ages.push({label:i+'岁',value:i});
	}
	for(var i=166; i<=186; i+=5) {
		$scope.conditions.statures.from_statures.push({label:i+'cm',value:i});
	}
	
	if ($rootScope.condition) {
		$scope.condition = {
			location: $rootScope.condition.location,
			from_age:$rootScope.condition.from_age, 
			from_age_label : get_age_label($rootScope.condition.from_age),
			to_age:$rootScope.condition.to_age,
			to_age_label : get_age_lable($rootScope.condition.to_age),
			from_stature:$rootScope.condition.from_stature, 
			from_stature_label : get_stature_label($rootScope.condition.from_stature),
			to_stature:$rootScope.condition.to_stature,
			to_stature_label : get_stature_label($rootScope.condition.to_stature),
		}
	} else {
		$scope.condition = {
			location: '不限',
			from_age: 0, 
			from_age_label : '不限',
			to_age: 0,
			to_age_label : '不限',
			from_stature:0, 
			from_stature_label : '不限',
			to_stature:0,
			to_stature_label : '不限',
		};
	}	
	
	var get_age_label = function(age) {return (age==0)?'不限':age+'岁'}
	var get_stature_label = function(stature) {return (stature==0)?'不限':stature+'cm'}
	
	$scope.reload_age = function(e) {
		if ($scope.sel_age.to_age > 0 && $scope.sel_age.to_age < $scope.sel_age.from_age) $scope.sel_age.to_age = 0;
		$scope.conditions.ages.to_ages = _load_age($scope.sel_age.from_age);
	};
	
	$scope.reload_stature = function(e) {
		if ($scope.sel_stature.to_stature > 0 && $scope.sel_stature.to_stature < $scope.sel_stature.from_stature) $scope.sel_stature.to_stature = 0;
		$scope.conditions.statures.to_statures = _load_stature($scope.sel_stature.from_stature);
	};
	
	var _load_age = function(s) {
		var obj = [];
		if (s == 0) s=18;
		for(var i=s; i<=65; i++) {
			obj.push({label:i+'岁',value:i});
		}
		obj.push({label:'不限', value:0});
		return obj;
	};
	var _load_stature = function(s, e) {
		var obj = [];
		if (s == 0) s=161;
		for(var i=s+4; i<=185; i+=5) {
			obj.push({label:i+'cm',value:i});
		}
		obj.push({label:'不限', value:0});
		return obj;
	}
	
	$scope.confirmAge = function() {
		$scope.condition.from_age = $scope.sel_age.from_age;
		$scope.condition.from_age_label = get_age_label($scope.sel_age.from_age);
		$scope.condition.to_age = $scope.sel_age.to_age;
		$scope.condition.to_age_label = get_age_label($scope.sel_age.to_age);
		$scope.agemodal.hide();
	}
	
	$scope.confirmStature = function() {
		$scope.condition.from_stature = $scope.sel_stature.from_stature;
		$scope.condition.from_stature_label = get_stature_label($scope.sel_stature.from_stature);
		$scope.condition.to_stature = $scope.sel_stature.to_stature;
		$scope.condition.to_stature_label = get_stature_label($scope.sel_stature.to_stature);
		$scope.staturemodal.hide();
	}
	
	$scope.cancelModal = function(mode) {
		if (mode == 'age') $scope.agemodal.hide();
		if (mode == 'stature') $scope.staturemodal.hide();
	}
	
	$ionicModal.fromTemplateUrl('search-age.html', {
        scope: $scope,
        animation: 'slide-in-down'
    }).then(function(modal) {
        $scope.agemodal = modal;
    });
	$scope.showAgeModal = function(){
		$scope.sel_age = {from_age: $scope.condition.from_age, to_age: $scope.condition.to_age};
		$scope.conditions.ages.to_ages = _load_age($scope.sel_age.from_age);
        $scope.agemodal.show();
    }
	
	$ionicModal.fromTemplateUrl('search-stature.html', {
        scope: $scope,
        animation: 'slide-in-down'
    }).then(function(modal) {
        $scope.staturemodal = modal;
    });
	$scope.showStatureModal = function(){
		$scope.sel_stature = {from_stature: $scope.condition.from_stature, to_stature: $scope.condition.to_stature};
		$scope.conditions.statures.to_statures = _load_stature($scope.sel_stature.from_stature);
        $scope.staturemodal.show();
    };
	
	$scope.search = function(){			
		$rootScope.condition = {
			location : $scope.condition.location,
			from_age : $scope.condition.from_age,
			to_age : $scope.condition.to_age,
			from_stature : $scope.condition.from_stature,
			to_stature : $scope.condition.to_stature
		};
		$ionicHistory.clearCache(['tab.home']).then(function(){
			$state.go('tab.home');
		});
		$timeout(function () {				
			//$state.go('tab.home');
		}, 100);
    }
	
	$scope.clear = function() {
        $rootScope.condition = null;
		$scope.condition = {
			location: '不限',
			from_age: 0, 
			from_age_label : '不限',
			to_age: 0,
			to_age_label : '不限',
			from_stature:0, 
			from_stature_label : '不限',
			to_stature:0,
			to_stature_label : '不限',
		};
	}
	
	$ionicPlatform.registerBackButtonAction(function () {			
		$state.go('tab.home');
	},100);
});