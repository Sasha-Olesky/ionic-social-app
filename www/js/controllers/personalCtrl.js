angular.module('starter.personal', [])

.controller('personalCtrl', function($scope, $ionicHistory, $ionicPlatform, $window, $state, $timeout, $ionicPopup, $ionicLoading, Session, APIManager, qbUser, ionicToast){
		
	$scope.go_state = function(state) {				
		$state.go(state);
	};
	
	$scope.go_back = function() {		
		Session.goBack();

		$scope.vidoeCallHangup();
	};
	
	$scope.go_personal = function(id) {
		$state.go('personal_space',{id:id});
	}
	
	$scope.user = Session.getSession('user');
	$scope.parent_height = $window.innerHeight + 'px';
	$scope.personal_id = $state.params.id;	

	// rijy start: values
	$scope.callees = [];
	$scope.app = {
            caller: {},
            callees: {},
            currentSession: {},
            mainVideo: 0
        };
    $scope.remoteStreamCounter = 0;
	$scope.sounds = {
                  'call': 'callingSignal',
                  'end': 'endCallSignal',
                  'rington': 'ringtoneSignal'
              };
    $scope.is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    $scope.isDeviceAccess = true;
    $scope.modal = {
                'income_call': '#income_call'
            };
	// rijy end: 
	
	var states = ['personal_space', 'video_chat', 'present_shop', 'funny_game', 'play_game'];
	if (states.indexOf($state.current.name) !== -1) {
		Session.saveHistory();
	}	
	
	$scope.personal = qbUser.getPersonal();	
	
	var url = 'get_personal';
	var data = {userid:$scope.personal_id};
	APIManager.get(url, data).then(function (res){
		console.log('get user data=========>' + res.data.personal);
		if(res.data.personal === null)
			return;
		$scope.personal = res.data.personal;
		$scope.personal['photo_large'] = "url('" + $scope.personal.photo + "')";
	});

	window.addEventListener('native.keyboardshow', keyboardShowHandler);
	window.addEventListener('native.keyboardhide', keyboardHideHandler);
	$ionicPlatform.registerBackButtonAction(function () {		
		var states = ['personal_space', 'personal_space.dynamics', 'personal_space.profile', 'video_chat', 'present_shop', 'funny_game', 'play_game'];
		if (states.indexOf($state.current.name) !== -1) {
			Session.goBack();
		}
	},100);
	
	
	if ($state.current.name == 'personal_space') {	
		$scope.show_footer = {
			value : false,
			click_send : false
		};
		$scope.cur_post = {
			sel_id : 0,
			sel_index : 0
		}
		var comment = document.getElementById('say_something');	
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
				$scope.cur_post.posts[$scope.cur_post.sel_index].comments = res.data.comments;
				comment.value = '';
			});
		};
		if ($scope.user.id !== $scope.personal_id) {
			var url = 'set_visitor';
			var data = {userid:$scope.user.id, tid:$scope.personal_id};
			APIManager.get(url, data);
		}
		function keyboardShowHandler(e){}
		function keyboardHideHandler(e){
			comment.blur();
			$scope.show_footer.value = false;
		}
	}	
	
	//*************** Dynamics ***************
	if ($state.current.name == 'personal_space.dynamics') {
		$scope.show_footer.value = false;
		var page = 1;
		var url = 'get_post_of_other';
		var data = {userid:$scope.personal_id, cur_userid:$scope.user.id, page:page};
		$ionicLoading.show();
		APIManager.get(url, data).then(function (res){
			$scope.cur_post.posts = res.data.posts;
			$scope.more = res.data.is_more;			
			$ionicLoading.hide();
		});
		
		$scope.loadMore = function() {
			page++;
			url = 'get_post_of_other';
			data = {userid:$scope.personal_id, cur_userid:$scope.user.id, page:page};
			$ionicLoading.show();
			APIManager.get(url, data).then(function(res) {
				$scope.cur_post.posts = $scope.cur_post.posts.concat(res.data.posts);
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
			$timeout(function () {
				comment.focus();
				$scope.show_footer.click_send = false;
			}, 0);
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
			page = 1;
			url = 'get_post_of_other';
			data = {userid:$scope.personal_id, cur_userid:$scope.user.id, page:page};
			$ionicLoading.show();
			APIManager.get(url, data).then(function(res) {
				$scope.cur_post.posts = res.data.posts;
				$scope.$broadcast('scroll.refreshComplete');
				$scope.more = res.data.is_more;
				$ionicLoading.hide();
			});
		};
		
	}
	
	//*************** Profile ***************
	if ($state.current.name == 'personal_space.profile') {		
		$scope.profile = {};
		var url = 'get_profile';
		var data = {userid:$scope.personal_id};
		$ionicLoading.show();
		APIManager.get(url, data).then(function (res){
			$scope.profile = res.data.profile;
			$scope.profile.phone = {type: 'password', value : res.data.profile.contact.phone};
			$scope.profile.qq = {type : 'password', value : res.data.profile.contact.qq};
			if ($scope.profile.membership && $scope.user.membership) {
				$scope.profile.phone.type = 'text';
				$scope.profile.qq.type = 'text';
			}
			$ionicLoading.hide();
		});
		
		$scope.upgradeMembership = function() {
			$state.go('update_membership');
		};
	}
	
	$scope.followMe = function(){
		var url = 'ifollow';
		var data = {userid:$scope.user.id, tid:$scope.personal_id};
		APIManager.get(url, data).then(function (res){
			ionicToast.show('关注成功', 'middle', false, 1500);
		});
	};
	
	var myVip, confirm_type;
	$scope.vipConfirm = function(ctype) {
		confirm_type = ctype;
		if (!$scope.user.membership || $scope.user.membership == '0') {
			myVip = $ionicPopup.show({	
				cssClass : 'vip-popup-css',
				templateUrl: 'templates/personal_space/vip_confirm.html',
				scope: $scope
			});
		} else {
			if (confirm_type == 2) {
				var url = 'apply_meet';
				var data = {userid:$scope.user.id, tid:$scope.personal_id};
				APIManager.get(url, data).then(function (res){
					ionicToast.show('申请成功', 'middle', false, 1500);
				});
			} else if (confirm_type == 3) {

				// go to video chat page
                $state.go('video_chat', {id:$scope.personal_id});

                // startCalling();
                getQbUserID();
				
			} else if (confirm_type == 4) {
				$state.go('funny_game', {id:$scope.personal_id});
			}
		}		
	};
	$scope.vip_cancel = function() {
		myVip.close();
	};
	$scope.vip_confirm = function() {
		myVip.close();
		$state.go('update_membership');
	};
	
	$scope.go_present_shop = function() {
		$state.go('present_shop', {id:$scope.personal_id});
	}
	
	//*************** gifts ***************
	if ($state.current.name == 'present_shop') {		
		var page = 1;
		var url = 'get_all_gifts';
		var data = {page:page};
		$ionicLoading.show();
		APIManager.get(url, data).then(function (res){
			$scope.gifts = res.data.gifts;
			$scope.more = res.data.is_more;			
			$ionicLoading.hide();
		});
		
		$scope.loadMore = function() {
			page++;
			url = 'get_all_gifts';
			data = {page:page};
			$ionicLoading.show();
			APIManager.get(url, data).then(function(res) {
				$scope.gifts = $scope.gifts.concat(res.data.gifts);
				$scope.$broadcast('scroll.infiniteScrollComplete');
				$scope.more = res.data.is_more;
				$ionicLoading.hide();
			});
		};
		
		$scope.maxScrollHeight = ($window.innerHeight - 110) + 'px';
		$scope.buyConfirm = function() {
			$state.go('buy_coins');
		};		
		var myGiftConfirm;
		$scope.gift = {
			quantity : 1
		};
		$scope.goBuyGift = function(pindex) {
			$scope.gift.quantity = 1;
			$scope.gift.data = $scope.gifts[pindex];
			myGiftConfirm = $ionicPopup.show({	
				cssClass : 'product-popup-css',
				templateUrl: 'templates/personal_space/buy_confirm.html',
				scope: $scope
			});
		};
		$scope.gift_cancel = function() {
			myGiftConfirm.close();
		};
		$scope.gift_confirm = function() {
			var cur_coins = $scope.gift.quantity * $scope.gift.data.gold_coins;
			if (cur_coins > $scope.user.gold_coins) {
				ionicToast.show('我的金币是不够的。', 'middle', false, 1500);
				return false;
			}
			var url = 'send_gift';
			var data = {userid:$scope.user.id, tid:$scope.personal_id, gift_id:$scope.gift.data.id, quantity:$scope.gift.quantity};
			APIManager.get(url, data).then(function (res){
				ionicToast.show('发送成功', 'middle', false, 1500);
				$scope.user.gold_coins = res.data.cur_coins;
				Session.setSession('user', $scope.user);
				myGiftConfirm.close();
			});
		};
		$scope.increaseQuantity = function() {
			$scope.gift.quantity++;
		};
		$scope.decreaseQuantity = function() {
			$scope.gift.quantity--;
			if ($scope.gift.quantity <= 0) $scope.gift.quantity = 1;
		};

	}
	
	
	
	$scope.play_game = function() {
		$state.go('play_game', {id:$scope.personal_id});
	};
	$scope.maxGameHeight = ($window.innerHeight - 180) + 'px';
	$scope.video_chat = function() {
		$state.go('video_chat', {id:$scope.personal_id});
	};
	var myGameCancel, action_id;
	$scope.cancelGame = function(a_id) {
		action_id = a_id;
		myGameCancel = $ionicPopup.show({	
			cssClass : 'game-popup-css',
			templateUrl: 'templates/personal_space/cancel_game.html',
			scope: $scope
		});
	};
	$scope.game_popup_cancel = function() {
		myGameCancel.close();
	};
	$scope.game_cancel = function() {
		myGameCancel.close();
		if (action_id == 0) {
			$scope.go_back();
		} else if (action_id == 1) {
			$state.go('present_shop', {id:$scope.personal_id});
		} else if (action_id == 3) {
			$state.go('video_chat', {id:$scope.personal_id});
		}
	};


	<!-- vidoe call processing -->
	$scope.vidoeCallHangup = function() {
		console.log('vidoeCallHangup ===========> before');
		if(!_.isEmpty(qbUser.getCurSession())) {
			console.log('vidoeCallHangup ===========> after');
            qbUser.getCurSession().stop({});
            qbUser.setCurSesssion({});
        }
	};


	$scope.changeFilter = function(selector, filterName) {
      	$(selector)
          	.removeClass(this.classesNameFilter)
          	.addClass( filterName );
    };


    /** Reject */
    $(document).on('click', '.j-decline', function() {
        if (!_.isEmpty(qbUser.getCurSession())) {
            qbUser.getCurSession().reject({});

            $($scope.modal.income_call).modal('hide');
            document.getElementById($scope.sounds.rington).pause();
        }
    });

    // get all users from qb service
    function getQbUserID () {
      	qbUser.getQBObject().createSession(function(err,result){
      		console.log($scope.personal);
   //    		var params = {full_name: [$scope.personal.phone]};
 
			// qbUser.getQBObject().users.get(params, function(err, result){
			//   if (result) {
			//     // success
			//     	console.log('getting_user=================>');
	  //         		console.log(result.items[0].user.id);
	  //         		alert(result.items[0].user.id);
			//   } else  {
			//     // error
			//     	alert('error');
			//   }
			// });
      		var params = {page: "1", per_page: "100", tags: ["dev"]};
            qbUser.getQBObject().users.listUsers(params, function(err, users){
                if (users) {
	                // success
	                userItem = users.items[0].user;
	                QBUsers = new Array();
	                for(var $i = 0; $i < users.items.length; $i ++) {

	                    qbUserItem = users.items[$i].user;
	                    if(qbUserItem.login == $scope.personal.phone) {
	                    	console.log('getting user info success ==========>' + qbUserItem.id);
	                    	startCalling(qbUserItem.id);	
	                    	return;
	                    }
	                }
               } else {
                  // error
                  alert('error');
                }
                alert('error');
            });
      	});
    }

	function notifyIfUserLeaveCall(session, userId, reason, title) {
      
        /** It's for p2p call */
        if(session.opponentsIDs.length === 1) {
      		console.log('p2p_call_stop');
      	}
    }


    function startCalling (opponentID) {
    	
    	// rijy start: video call starting
		var $el = $(this),
            usersWithoutCaller = [],
            user = {},
            classNameCheckedUser = 'users__user-active';
		user.id = +$.trim( opponentID );
        user.name = $.trim( opponentID );
        $scope.callees = [];

        // if ($el.hasClass(classNameCheckedUser)) {
            // delete app.callees[user.id];
            // $el.removeClass(classNameCheckedUser);
        // } else {
            $scope.callees[user.id] = user.id;
            // $el.addClass(classNameCheckedUser);
        // }

        var videoElems = '',
          mediaParams = {
              audio: true,
              video: true,
              options: {
                  muted: true,
                  mirror: true
              },
              elemId: 'localVideo'
          };

          console.log('starting vidoechat========>');

        // if(!window.navigator.onLine) {
        //   // qbApp.MsgBoard.update('no_internet');
        //   console.log('no internet');
        // } else {
          if ( _.isEmpty($scope.callees) ) {
            // $('#error_no_calles').modal();
            console.log('error no callees')
          } else {
            // qbApp.MsgBoard.update('create_session');
            console.log('create session========>');
            qbUser.setCurSesssion(qbUser.getQBObject().webrtc.createNewSession(Object.keys($scope.callees), qbUser.getQBObject().webrtc.CallType.VIDEO));
            console.log(qbUser.getCurSession());

            qbUser.getCurSession().getUserMedia(mediaParams, function(err, stream) {
            	console.log('stream result========>');
              if (err || !stream.getAudioTracks().length || !stream.getVideoTracks().length) {
                var errorMsg = '';

                if(err && err.message) {
                  errorMsg += 'Error: ' + err.message;
                } else {
                  errorMsg += 'device_not_found';
                }
                qbUser.getCurSession().stop({});

                // showErrorAccessPermission(err);
                // qbApp.MsgBoard.update(errorMsg, {name: app.caller.full_name}, true);
                console.log('errorMsg========>' + errorMsg);
              } else {
              	var extension = {username: qbUser.getPersonal().username};
                qbUser.getCurSession().call(extension, function(error) {
                  if(error) {
                      console.warn(error.detail);
                  } else {
                    console.log('calling chat success ===>');
                  }
                });

                if (window.device.platform === 'iOS') {
                    cordova.plugins.iosrtc.selectAudioOutput('speaker');
                }
              }
            });
          
          }
        // }
        // rijy end
    }
	
	<!-- qbchat listeners -->
	qbUser.getQBObject().chat.onDisconnectedListener = function() {
        console.log('onDisconnectedListener.');
        var initUIParams = authorizationing ? {withoutUpdMsg: false, msg: 'no_internet'} : {withoutUpdMsg: false, msg: 'login'};

      	$scope.app.caller = {};
      	$scope.app.callees = [];
      	$scope.app.mainVideo = 0;
      	remoteStreamCounter = 0;

      	// initializeUI(initUIParams);
    };

    qbUser.getQBObject().webrtc.onCallStatsReport = function onCallStatsReport(session, userId, stats) {
        console.group('onCallStatsReport');
        console.log('userId: ' + userId);
        // console.log('Stats: ', stats);
      	console.groupEnd();

      	/**
       	* Hack for Firefox
       	* (https://bugzilla.mozilla.org/show_bug.cgi?id=852665)
       	*/
      	if($scope.is_firefox) {
        	var inboundrtp = _.findWhere(stats, {type: 'inboundrtp'});

        	if(!inboundrtp || !isBytesReceivedChanges(userId, inboundrtp)) {

	        	console.warn("This is Firefox and user " + userId + " has lost his connection.");

          		if(!_.isEmpty(qbUser.getCurSession())) {
            		qbUser.getCurSession().closeConnection(userId);

            		notifyIfUserLeaveCall(session, userId, 'disconnected', 'Disconnected');
          		}
        	}
      	}
    };

    qbUser.getQBObject().webrtc.onSessionCloseListener = function onSessionCloseListener(session){
        console.log('onSessionCloseListener: ' + session);

      	/** pause play call sound */
      	document.getElementById($scope.sounds.call).pause();
      	document.getElementById($scope.sounds.end).play();

       	if(!$scope.isDeviceAccess) {
            $scope.isDeviceAccess = true;
      	} else {
        	if(session.opponentsIDs.length > 1) {
              	// qbApp.MsgBoard.update('call_stop', {name: app.caller.full_name});
                console.log('call_stop');
          	}
      	}


        /** delete blob from myself video */
        document.getElementById('localVideo').src = '';
        /** clear main video */
        qbUser.getCurSession().detachMediaStream('main_video');
        $scope.app.mainVideo = 0;
        $scope.remoteStreamCounter = 0;
    };

    qbUser.getQBObject().webrtc.onUserNotAnswerListener = function onUserNotAnswerListener(session, userId) {
        console.group('onUserNotAnswerListener.');
        console.log('UserId: ' + userId);
        console.log('Session: ' + session);
        console.groupEnd();
    };

    qbUser.getQBObject().webrtc.onUpdateCallListener = function onUpdateCallListener(session, userId, extension) {
        console.group('onUpdateCallListener.');
        console.log('UserId: ' + userId);
        console.log('Session: ' + session);
        console.log('Extension: ' + JSON.stringify(extension));
        console.groupEnd();

      	$scope.changeFilter('#remote_video_' + userId, extension.filter);
      	if (+($scope.app.mainVideo) === userId) {
            $scope.changeFilter('#main_video', extension.filter);
      	}
    };

    
    qbUser.getQBObject().webrtc.onAcceptCallListener = function onAcceptCallListener(session, userId, extension) {
      	console.group('onAcceptCallListener.');
        console.log('UserId: ' + userId);
        console.log('Session: ' + session);
        console.log('Extension: ' + JSON.stringify(extension));
        console.groupEnd();

      	// var userInfo = _.findWhere(QBUsers, {id: userId}),
       //    filterName = $.trim( $(ui.filterClassName).val() );

      	document.getElementById($scope.sounds.call).pause();

      	// $scope.app.currentSession.update({filter: 'no'});
      	qbUser.setCurSesssion(session);

    };

    qbUser.getQBObject().webrtc.onRejectCallListener = function onRejectCallListener(session, userId, extension) {
      	console.group('onRejectCallListener.');
        console.log('UserId: ' + userId);
        console.log('Session: ' + session);
        console.log('Extension: ' + JSON.stringify(extension));
      	console.groupEnd();
    };

    qbUser.getQBObject().webrtc.onStopCallListener = function onStopCallListener(session, userId, extension) {
      	console.group('onStopCallListener.');
        console.log('UserId: ' + userId);
      	console.log('Session: ' + session);
        console.log('Extension: ' + JSON.stringify(extension));
      	console.groupEnd();

      	notifyIfUserLeaveCall(session, userId, 'hung up the call', 'Hung Up');
    };

    qbUser.getQBObject().webrtc.onRemoteStreamListener = function onRemoteStreamListener(session, userID, stream) {
      	console.group('onRemoteStreamListener.');
        console.log('userID: ' + userID);
        console.log('Session: ' + session);
      	console.groupEnd();
      	console.log('peerConnections ===============>' + session.peerConnections);
      	qbUser.setCurSesssion(session);
      	qbUser.getCurSession().peerConnections[userID].stream = stream;
      	console.log('remote_video_start ==========>');

      	// $scope.app.currentSession.attachMediaStream('remote_video_' + userID, stream);
      	qbUser.getCurSession().attachMediaStream('main_video', stream);

      	if( $scope.remoteStreamCounter === 0) {
        	$scope.app.mainVideo = userID;
          	++$scope.remoteStreamCounter;
      	}

      	// if(!callTimer) {
       //    	callTimer = setInterval( function(){ ui.updTimer.call(ui); }, 1000);
      	// }
    };

    qbUser.getQBObject().webrtc.onSessionConnectionStateChangedListener = function onSessionConnectionStateChangedListener(session, userID, connectionState) {
      	if (window.device.platform === 'iOS') {
        	cordova.plugins.iosrtc.selectAudioOutput('speaker');
      	}
      	console.group('onSessionConnectionStateChangedListener.');
        console.log('UserID: ' + userID);
        console.log('Session: ' + session);
        console.log('Сonnection state: ' + connectionState);
      	console.groupEnd();

      	var connectionStateName = _.invert(qbUser.getQBObject().webrtc.SessionConnectionState)[connectionState],
          $calleeStatus = $('.j-callee_status_' + userID),
          isCallEnded = false;

	    if(connectionState === qbUser.getQBObject().webrtc.SessionConnectionState.CONNECTING) {
          	$calleeStatus.text(connectionStateName);
      	}

      	if(connectionState === qbUser.getQBObject().webrtc.SessionConnectionState.CONNECTED) {
          	
          	$calleeStatus.text(connectionStateName);
		}

      	if(connectionState === qbUser.getQBObject().webrtc.SessionConnectionState.COMPLETED) {
            $calleeStatus.text('connected');
      	}

      	if(connectionState === qbUser.getQBObject().webrtc.SessionConnectionState.DISCONNECTED){
          	$calleeStatus.text('disconnected');
      	}

      	if(connectionState === qbUser.getQBObject().webrtc.SessionConnectionState.CLOSED){

          	// document.getElementById($scope.sounds.rington).pause();

          	if($scope.app.mainVideo === userID) {
            	$('#remote_video_' + userID).removeClass('active');

              	$scope.changeFilter('#main_video', 'no');
              	qbUser.getCurSession().detachMediaStream('main_video');
              	$scope.app.mainVideo = 0;
          	}

          	if( !_.isEmpty(qbUser.getCurSession()) ) {
            	if ( Object.keys(qbUser.getCurSession().peerConnections).length === 1 || userID === $scope.app.currentSession.initiatorID) {
                 	$($scope.modal.income_call).modal('hide');
              	}
          	}

          	isCallEnded = _.every(qbUser.getCurSession().peerConnections, function(i) {
                return i.iceConnectionState === 'closed';
          	});

          	/** remove filters */
          	if( isCallEnded ) {
                $scope.changeFilter('#localVideo', 'no');
              	$scope.changeFilter('#main_video', 'no');
              	// $(ui.filterClassName).val('no');
          	}

	        if (qbUser.getCurSession().currentUserID === qbUser.getCurSession().initiatorID && !isCallEnded) {
            	/** get array if users without user who ends call */
              	// takedCallCallee = _.reject(takedCallCallee, function(num){ return num.id === +userID; });

              	console.log('accept_call');
          	}
        }
    };
});