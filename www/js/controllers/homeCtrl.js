angular.module('starter.home', [])

.controller('homeCtrl', function($scope, $ionicPlatform, $ionicHistory, $rootScope, $state, Session, APIManager, qbUser, ionicToast, $ionicLoading){
	
	$ionicHistory.clearHistory();
	Session.clearSession('history');
	Session.saveHistory();		
	
	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){ 
		if (toState.name == 'tab.home') {
			$ionicHistory.clearHistory();
			Session.clearSession('history');
			Session.saveHistory();
			$ionicPlatform.registerBackButtonAction(function (event) {		
				event.preventDefault();
				Session.exitConfirm($scope);				
			},100);
		}
	});
	
	$ionicLoading.show();
	$scope.page = 1;
	var url = 'search';
	var data = {userid:Session.getSession('user').id, page:$scope.page};
	if ($rootScope.condition) {
		data.address = $rootScope.condition.location;
		if (data.address == '不限') data.address = 0;
		data.from_age = $rootScope.condition.from_age;
		data.to_age = $rootScope.condition.to_age;
		data.from_stature = $rootScope.condition.from_stature;
		data.to_stature = $rootScope.condition.to_stature;
	}
	
	APIManager.post(url, data).then(function(res) {
		if(res.data != '')
			$scope.users = res.data.users;
		console.log($scope.users);
		$ionicLoading.hide();
		$scope.more = res.data.is_more;
	});
	
	$scope.likeTa = function(user){
		$ionicLoading.show();
		if(user.islike == false){
			var url = 'ifollow';
			var data = {userid:Session.getSession('user').id, tid:user.id}
			APIManager.get(url, data).then(function(res) {
				user.islike = true;
				user.likes++;
				$ionicLoading.hide();
			});
		}else{
			var url = 'remove_follow';
			var data = {userid:Session.getSession('user').id, tid:user.id}
			APIManager.get(url, data).then(function(res) {
				user.islike = false;
				user.likes--;
				$ionicLoading.hide();
			});
		}
	};
	$scope.goPersonal = function(userid) {
		$state.go('personal_space', {id:userid});
	};
	$scope.nextToSearch = function(){
      $state.go('search');
    }
    $scope.nextToAlert = function(){
		$rootScope.goBack = $state.current.name;
        $state.go('alert');
    }

	$scope.loadMore = function() {
		var url = 'get_users';
		$scope.page++;
		$ionicLoading.show();
		var data = {userid:Session.getSession('user').id, page:$scope.page}
		APIManager.get(url, data).then(function(res) {
			$scope.users = $scope.users.concat(res.data.users);
			$scope.$broadcast('scroll.infiniteScrollComplete');
			$scope.more = res.data.is_more;
			$ionicLoading.hide();
		});
	};
	
	$scope.doRefresh = function() {
		$scope.page = 1;
		var url = 'get_users';
		data = {userid:Session.getSession('user').id, page:$scope.page};
		$ionicLoading.show();
		APIManager.get(url, data).then(function(res) {
			$scope.users = res.data.users;
			$scope.$broadcast('scroll.refreshComplete');
			$scope.more = res.data.is_more;
			$ionicLoading.hide();
		});
	};
	
	/** Accept */
	$scope.modal = {
                'income_call': '#income_call'
            };

    $(document).on('click', '.j-accept', function() {
    	$state.go('video_chat', {id: 33});

        var mediaParams = {
                audio: true,
                video: true,
                elemId: 'localVideo',
                options: {
                    muted: true,
                    mirror: true
                }
            },
            videoElems = '';

        $($scope.modal.income_call).modal('hide');

        // document.getElementById($scope.sounds.rington).pause();

        qbUser.getCurSession().getUserMedia(mediaParams, function(err, stream) {
            if (err || !stream.getAudioTracks().length || !stream.getVideoTracks().length) {
              var errorMsg = '';

              if(err && err.message) {
                errorMsg += 'Error: ' + err.message;
              } else {
                errorMsg += 'device_not_found';
              }

              console.log(errorMsg);
              qbUser.getCurSession().stop({});
            } else {
                var opponents = [qbUser.getCurSession().initiatorID];
                    
                /** get all opponents */
                qbUser.getCurSession().opponentsIDs.forEach( function(userID, i, arr) {
                    if(userID != qbUser.getCurSession().currentUserID){
                        opponents.push(userID);
                    }
                });

                
                qbUser.getCurSession().accept({});

            }
        });
    });

	<!-- qb video call listener -->
	qbUser.getQBObject().webrtc.onCallListener = function onCallListener(session, extension) {
      	console.group('onCallListener.');
        console.log('Session: ' + session);
        console.log('Extension: ' + JSON.stringify(extension));
      	console.groupEnd();

      	if(!_.isEmpty(extension.username)) {
        	qbUser.setPersonal(extension);
        }

      	/** close previous modal if his is exist */
      	$($scope.modal.income_call).modal('hide');

      	// var userInfo = _.findWhere(QBUsers, {id: session.initiatorID});

      	qbUser.setCurSesssion(session);

      	/** set name of caller */
      	$('.j-ic_initiator').text( extension.username );

      	$($scope.modal.income_call).modal('show');

      	// document.getElementById($('.ringtoneSignal')).play();
    };
});