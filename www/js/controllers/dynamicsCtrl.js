angular.module('starter.dynamics', [])

.controller('dynamicsCtrl', function($scope, $ionicPlatform, $state, $timeout, $rootScope, $ionicHistory, Session, $ionicLoading, APIManager, ionicToast){
	
	$scope.user = Session.getSession('user');
	
	window.addEventListener('native.keyboardshow', keyboardShowHandler);
	window.addEventListener('native.keyboardhide', keyboardHideHandler);	
	
	$scope.go_personal = function(id) {
		$state.go('personal_space',{id:id});
	}		
	
	var states = ['tab.dynamics'];
	if (states.indexOf($state.current.name) !== -1) {
		$ionicHistory.clearHistory();
		Session.clearSession('history');
		Session.saveHistory();
	}
	
	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){ 
		if (toState.name == 'tab.dynamics') {
			$ionicHistory.clearHistory();
			Session.clearSession('history');
			Session.saveHistory();
			$ionicPlatform.registerBackButtonAction(function (event) {		
				event.preventDefault();
				Session.exitConfirm($scope);	
			},100);
		}
	});
	
	$scope.nextToAlert = function(){
		$rootScope.goBack = "tab.dynamics";
		$state.go('alert');
	}
	
	if ($state.current.name == 'tab.dynamics') {	
		$scope.show_footer = {
			value : false,
			click_send : false
		};
		$scope.cur_post = {
			sel_id : 0,
			sel_index : 0,
			page : 1
		}
		var comment = document.getElementById('say_something');	
		function keyboardHideHandler(e){
			comment.blur();
			$scope.show_footer.value = false;
		}
		$scope.hide_say = function() {
			if ($scope.show_footer.click_send) {
				comment.focus();
				$scope.show_footer.click_send = false;
				return false;
			}
			$scope.show_footer.value = false;			
		};
		$scope.send_comment = function() {	

			if (comment.value == '') {
				ionicToast.show('请输入内容', 'middle', false, 1500);
				$scope.show_footer.click_send = true;
				return false;
			}
			var url = 'insert_comment';
			var data = {postid:$scope.cur_post.sel_id, userid:$scope.user.id, comment:comment.value};
		
			APIManager.post(url, data).then(function (res){	
				if($state.current.name == 'tab.dynamics.square')
					$scope.cur_post.posts[$scope.cur_post.sel_index].comments = res.data.comments;
				else
					$scope.cur_post.friendposts[$scope.cur_post.sel_index].comments = res.data.comments;
				
				comment.value = '';
			});
		};
		if ($scope.user.id !== $scope.personal_id) {
			var url = 'set_visitor';
			var data = {userid:$scope.user.id, tid:$scope.personal_id};
			APIManager.get(url, data);
		}
		function keyboardShowHandler(e){}
		
	}	
	
	if ($state.current.name == 'tab.dynamics.square') {
	
		try{	
			$scope.show_footer.value = false;
		}catch(e){
		
			$scope.show_footer = {
				value : false,
				click_send : false
			};
		}
			
		
		if(typeof($scope.cur_post) == "undefined"){
			$scope.cur_post = {
				sel_id : 0,
				sel_index : 0,
				page : 1
			}
		}
		var url = 'get_posts';
		var data = {userid:$scope.user.id, page:$scope.cur_post.page};
		$ionicLoading.show();
		APIManager.get(url, data).then(function (res){
			$scope.cur_post.posts = res.data.posts;			
			$scope.more = res.data.is_more;			
			$ionicLoading.hide();
		});
		
		$scope.loadMore = function() {
			$scope.cur_post.page++;
			url = 'get_posts';
			data = {userid:$scope.user.id, page:$scope.cur_post.page};
			$ionicLoading.show();
			APIManager.get(url, data).then(function(res) {
				$scope.cur_post.posts = $scope.cur_post.posts.concat(res.data.posts);
				$scope.$broadcast('scroll.infiniteScrollComplete');
				$scope.more = res.data.is_more;
				$ionicLoading.hide();
			});
		};
		
		
		$scope.start_comment = function(p_id, i) {		
			var comment = document.getElementById('say_something');
			$scope.cur_post.sel_id = p_id;
			$scope.cur_post.sel_index = i;
			$scope.show_footer.value = true;
			$timeout(function () {
				comment.focus();
				$scope.show_footer.click_send = false;
			}, 0);
		};
		
		$scope.send_comment = function() {	
			if (comment.value == '') {
				ionicToast.show('请输入内容', 'middle', false, 1500);
				$scope.show_footer.click_send = true;
				return false;
			}
			var url = 'insert_comment';
			var data = {postid:$scope.cur_post.sel_id, userid:$scope.user.id, comment:comment.value};	
			APIManager.post(url, data).then(function (res){	
				console.log($scope.cur_post.posts);
				if($state.current.name == 'tab.dynamics.square')
					$scope.cur_post.posts[$scope.cur_post.sel_index].comments = res.data.comments;
				else
					$scope.cur_post.friendposts[$scope.cur_post.sel_index].comments = res.data.comments;
				
				comment.value = '';
			});
		};

		$scope.like_post = function(p_id, i) {
			if ($scope.cur_post.posts[i].is_like) {
				url = 'dislike_post';
			} else {
				url = 'like_post';
			}
			var data = {postid:p_id, userid:$scope.user.id};
			APIManager.get(url, data).then(function (res){
				if (url == 'dislike_post') {
					var ii = -1;
					$scope.cur_post.posts[i].like_users.forEach(function(item, index) {
						if (item.id == $scope.user.id) {
							ii = index;
							return;
						}
					});
					if (ii != -1) {
						$scope.cur_post.posts[i].like_users.splice(ii, 1);
					}
				} else {
					$scope.cur_post.posts[i].like_users.push({id:$scope.user.id, photo:$scope.user.photo});
				}
				$scope.cur_post.posts[i].is_like = !$scope.cur_post.posts[i].is_like;
			});
		};	
		$scope.doRefresh = function() {
			$scope.cur_post.page = 1;
			var url = 'get_posts';
			data = {userid:$scope.user.id, page:$scope.cur_post.page};
			$ionicLoading.show();
			APIManager.get(url, data).then(function(res) {
				$scope.cur_post.posts = res.data.posts;
				$scope.$broadcast('scroll.refreshComplete');
				$scope.more = res.data.is_more;
				$ionicLoading.hide();
			});
		};
	}else if($state.current.name == 'tab.dynamics.friend'){
		try{	
			$scope.show_footer.value = false;
		}catch(e){
		
			$scope.show_footer = {
				value : false,
				click_send : false
			};
		}
		if(!$scope.hasOwnProperty('cur_post')){
			$scope.cur_post = {
				sel_id : 0,
				sel_index : 0,
				friendpage : 1
			}
		}
		var url = 'get_friendposts';
		var data = {userid:$scope.user.id, page:$scope.cur_post.page};
		$ionicLoading.show();
		APIManager.get(url, data).then(function (res){
			$scope.cur_post.friendposts = res.data.friendposts;			
			
			$scope.more = res.data.is_more;			
			$ionicLoading.hide();
		});
		
		$scope.loadFriendMore = function() {
			$scope.cur_post.friendpage++;
			url = 'get_friendposts';
			data = {userid:$scope.user.id, page:$scope.cur_post.friendpage};
			$ionicLoading.show();
			APIManager.get(url, data).then(function(res) {
				$scope.cur_post.friendposts = $scope.cur_post.friendposts.concat(res.data.friendposts);
				$scope.$broadcast('scroll.infiniteScrollComplete');
				$scope.more = res.data.is_more;
				$ionicLoading.hide();
			});
		};
		
		var comment = document.getElementById('say_something');
		$scope.start_comment = function(p_id, i) {		

			$scope.cur_post.sel_id = p_id;
			$scope.cur_post.sel_index = i;
			$scope.show_footer.value = true;
			console.log($scope.cur_post.friendposts);
			$timeout(function () {
				comment.focus();
				$scope.show_footer.click_send = false;
			}, 0);
		};
		$scope.like_post = function(p_id, i) {
			if ($scope.cur_post.friendposts[i].is_like) {
				url = 'dislike_post';
			} else {
				url = 'like_post';
			}
			var data = {postid:p_id, userid:$scope.user.id};
			APIManager.get(url, data).then(function (res){
				if (url == 'dislike_post') {
					var ii = -1;
					$scope.cur_post.friendposts[i].like_users.forEach(function(item, index) {
						if (item.id == $scope.user.id) {
							ii = index;
							return;
						}
					});
					if (ii != -1) {
						$scope.cur_post.friendposts[i].like_users.splice(ii, 1);
					}
				} else {
					$scope.cur_post.friendposts[i].like_users.push({id:$scope.user.id, photo:$scope.user.photo});
				}
				$scope.cur_post.friendposts[i].is_like = !$scope.cur_post.friendposts[i].is_like;
			});
		};	
		$scope.doFriendRefresh = function() {
			$scope.cur_post.page = 1;
			var url = 'get_friendposts';
			data = {userid:$scope.user.id, page:$scope.cur_post.page};
			$ionicLoading.show();
			APIManager.get(url, data).then(function(res) {
				$scope.cur_post.friendposts = res.data.friendposts;
				$scope.$broadcast('scroll.refreshComplete');
				$scope.more = res.data.is_more;
				$ionicLoading.hide();
			});
		};
	}
	
	
});