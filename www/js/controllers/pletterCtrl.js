angular.module('starter.pletter', [])
.controller('pletterCtrl', function($scope, $state, APIManager, Session,$window, $ionicNavBarDelegate,$ionicLoading,$rootScope) {
	$scope.max_list_height = ($window.innerHeight - 140) + 'px';
	$scope.received_items = [];
	$scope.sent_items = [];
	$scope.chatWith = function(userid, target,islike) {
		$state.go('chatwith', { userid: userid, target: target,islike: islike});
	}
	$scope.$watch(function() {
		  return $rootScope.uncount;
		}, function() {
		if($state.current.name == 'tab.letter.send')
			getConversationList(1);
		else
			getConversationList(0);
        });

	var getConversationList = function GetConverSationList(mode){
		RongCloudLibPlugin.getConversationList(
			function(ret, err) {
				if (ret) {
					var result = ret.result;
				
					angular.forEach(result, function(value, index) {
						angular.forEach($scope.sent_items, function(send_items, index) {
							if(mode == 1){
								if(value.targetId == send_items.to_userid){
									if (value.objectName == 'RC:TxtMsg') {
										send_items.message = value.latestMessage.text;
									} else if (value.objectName == 'RC:VcMsg') {
										send_items.message = '[?音]';
									}
									var date = new Date(value.sentTime);
									send_items.time = date.getHours() + ":" + date.getMinutes();
									send_items.count = value.unreadMessageCount;
								}
							}else{
								if(value.senderUserId == send_items.from_userid){
									if (value.objectName == 'RC:TxtMsg') {
										send_items.message = value.latestMessage.text;
									} else if (value.objectName == 'RC:VcMsg') {
										send_items.message = '[?音]';
									}
									var date = new Date(value.sentTime);
									send_items.time = date.getHours() + ":" + date.getMinutes();
									send_items.count = value.unreadMessageCount;
								}
							}
						});
					});
				}
				if (err) {
					//alert('getConversationList err:' + JSON.stringify(err));
					IMService.initRong(res.data.token);
				}
				$ionicLoading.hide();
			}
		);
	}

	var getSendContacts = function(){
		$scope.sent_items = [];
		$scope.page = 1;
		var url = 'get_send_chatlist';
		var data = {userid:Session.getSession('user').id, page:$scope.page};
		
		$ionicLoading.show();
		APIManager.get(url, data).then(function (res){
			$scope.sent_items = res.data.contacts;	
		
			console.log($scope.sent_items);
			$scope.more = res.data.is_more;	
			$ionicLoading.hide();
			getConversationList(1);
		});
	}
	
	var getReceiveContacts = function(){
		$scope.sent_items = [];
		$scope.page = 1;
		var url = 'get_receive_chatlist';
		var data = {userid:Session.getSession('user').id, page:$scope.page};
		$ionicLoading.show();
		APIManager.get(url, data).then(function (res){
			$scope.sent_items = res.data.contacts;	
			console.log($scope.sent_items);
			$scope.more = res.data.is_more;	
			$ionicLoading.hide();
			getConversationList(0);
		});
	}
	var init = function() {
		if($state.current.name == 'tab.letter.send'){
			getSendContacts();
		}else if($state.current.name  == 'tab.letter.receive'){
			getReceiveContacts();
		}
	}
	$scope.$on('$ionicView.beforeEnter', function() {
		if(!Session.isLoggedIn()){
			$state.go('login', { param: 'letter' });
		}
		init();
	});
	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){ 
		if(fromState.name == "chatwith"){
			if($state.current.name == 'tab.letter.send')
				getConversationList(1);
			else
				getConversationList(0);	
		}
	});
	
})
.controller('chatCtrl', function($scope, $state, $stateParams, $ionicScrollDelegate, $timeout, voiceService, Session) {

        $scope.targetId = $stateParams.userid;
        $scope.target = $stateParams.target; //聊天对象 
        $scope.islike = $stateParams.islike; //是否喜欢 
        $scope.user = Session.getSession('user'); //当前用户
        $scope.hisMsgs = [];
        $scope.vm = {
            text: ''
        };
        $scope.data = {
            hintText: '',
            showHint: false
        }

        $scope.doRefresh = function() {
            $timeout(function() {
                getHistoryMsg($scope.targetId);
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);

        };
        $('#RongIMexpression').qqFace({
            id: 'facebox', //表情盒子的ID
            assign: 'msgContent', //给那个控件赋值
            path: 'img/face/' //表情存放的路径
        });
        //标记已读
        var clearMessagesUnreadStatus = function() {
                RongCloudLibPlugin.clearMessagesUnreadStatus({
                        conversationType: 'PRIVATE',
                        targetId: $scope.targetId
                    },
                    function(ret, err) {
                        if (err) {
                            //  alert("clearMessagesUnreadStatus error: " + JSON.stringify(err));
                        }
                    }
                );
            }
            //获取最新消息
        var getLatestMsg = function(targetid) {
                RongCloudLibPlugin.getLatestMessages({
                        conversationType: 'PRIVATE',
                        targetId: targetid,
                        count: 20
                    },
                    function(ret, err) {
                        //  alert('获取最新消息targetid' + targetid);
                        if (ret) {
                            //  alert("getLatestMessages:" + JSON.stringify(ret));
                            var result = new Array(),
                                tmp;
                            for (var i = ret.result.length - 1; i >= 0; i--) {
                                tmp = ret.result[i];
                                tmp = myUtil.resolveMsg(tmp);
                                // var tmpContent = $compile(tmp.content)($scope);
                                // tmp.content = tmpContent[0];
                                result.unshift(tmp);
                                // if(tmp.content.thumbPath){
                                //    alert(tmp.content.thumbPath);
                                // }
                            }
                            $scope.hisMsgs = result;
                        }
                        if (err) {
                            //    alert("getLatestMessages error: " + JSON.stringify(err));
                        }

                    }
                );
            }
            //获取历史消息
        var getHistoryMsg = function(targetid) {
                RongCloudLibPlugin.getHistoryMessages({
                        conversationType: 'PRIVATE',
                        targetId: targetid,
                        count: 20
                    },
                    function(ret, err) {

                        if (ret) {
                            alert("getHistoryMessages:" + JSON.stringify(ret));
                            var result = new Array(),
                                tmp;
                            for (var i = ret.result.length - 1; i >= 0; i--) {
                                tmp = ret.result[i];
                                tmp = myUtil.resolveMsg(tmp);
                                result.push(tmp);
                                //alert(JSON.stringify(tmp));
                            }
                            var hisArr = result.concat($scope.hisMsgs);
                            $scope.hisMsgs = hisArr;
                        }
                        if (err) {
                            //  alert("getHistoryMessages error: " + JSON.stringify(err));
                        }
                    }
                );
            }
            //添加消息
        var appendNewMsg = function(msg, flag) {
			
            // $scope.lstResult = JSON.stringify(msg);
            var curMsg = myUtil.resolveMsg(msg);
            //消息此时未发送成功，可以加入样式标明；成功后更新样式

            $scope.$apply(function() {
                $scope.hisMsgs.push(curMsg);
				//alert(JSON.stringify($scope.hisMsgs));
            });
            $ionicScrollDelegate.scrollBottom(true);
        }
        $scope.sendMsg = function() {
		//$scope.vm.text = $scope.vm.text + ' ';
		RongCloudLibPlugin.sendTextMessage({
                    conversationType: 'PRIVATE',
                    targetId: $scope.targetId,
                    text: $scope.vm.text,
                    extra: "this is a extra text"
                },
                function(ret, err) {
                    $scope.vm.text = '';
                    // alert("sendMessage:" + JSON.stringify(ret));
                    if (ret) {
                        if (ret.status == "prepare") {
                            appendNewMsg(ret.result.message, false);
                        }
                        if (ret.status == "success") {
                            // alert("success");

                        }
                    }
                    if (err) {
                         alert("sendTextMessage error: " + JSON.stringify(err));
                    }
                }
            );
        }
        $scope.navBack = function() {
            $state.go('tab.letter');
        }

        $scope.startRecord = function() {
            $scope.data.showHint = true;
            $scope.data.hintText = '松开 结束';
            voiceService.startRecord(60);
        }
        $scope.stopRecord = function() {
            $scope.data.showHint = false;
            voiceService.stopRecord();
            var path = voiceService.getFile();
            var record = voiceService.getRecord();
            path = path.replace('file://', '');
           // $timeout(function() {
			RongCloudLibPlugin.sendVoiceMessage({
					conversationType: 'PRIVATE',
					targetId: $scope.targetId,
					voicePath: path,
					duration: record.getDuration(),
					extra: "this is a extra voice"
				},
				function(ret, err) {
					if (ret) {
						alert("sendVoiceMessage:" + JSON.stringify(ret));
						if (ret.status == "prepare") {
							appendNewMsg(ret.result.message, true);
						}
						if (ret.status == "success") {

						}
					}
					if (err) {
						 alert("sendVoiceMessage error: " + JSON.stringify(err));
						console.log("sendVoiceMessage error: " + JSON.stringify(err));
					}
				}
			);
           // }, 2000);

        }
        $scope.play = function(voiFile) {
            var mediaRec = new Media(voiFile);
            //开始播放录音
            mediaRec.play({ numberOfLoops: 1 });
            return false;
        };
        $scope.$on('$ionicView.beforeEnter', function() {
            $scope.$emit('child', true);
            $ionicScrollDelegate.scrollBottom(true);
            getLatestMsg($scope.targetId);
			clearMessagesUnreadStatus();
        });
        // 及时消息
        $scope.$on('to-newmsg', function(e, data) {
            //alert('frienddetail newMessage' + data);
            var jsonMsg = JSON.parse(data);
            if ($scope.targetId == jsonMsg.targetId) {
                clearMessagesUnreadStatus();
                var tmpMsg = myUtil.resolveMsg(jsonMsg);
                $scope.$apply(function() {
                    $scope.hisMsgs.push(tmpMsg);
                });
                $ionicScrollDelegate.scrollBottom(true);
            }
        });
    });