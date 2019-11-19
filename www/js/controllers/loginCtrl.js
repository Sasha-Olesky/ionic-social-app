angular.module('starter.login', [])

.controller('loginCtrl', function($scope, $state,$rootScope, $timeout, $ionicActionSheet, $cordovaCamera, $cordovaFileTransfer, $ionicPlatform, $ionicLoading, Session, APIManager, qbUser, ionicToast,IMService,$interval) {
	
	$scope.user = {
		phone : '',
		password : '',
		hasValue : true
	};
	
	$scope.findpwd = {
		phone: '',
		code: '',
		source: '',
		caption: '发送',
		wait: 0,
		status:false
	}
	
	$scope.changpwd = {
		password:'',
		confirm:''
	}

	$scope.reset_password = function() {        
        $scope.user.password = null;
    };

    $scope.$watch('user.password',function (oldValue, newValue) {
        if(oldValue){
            $scope.user.hasValue = false;
        }else{
            $scope.user.hasValue = true;
        }
    });
	
	$scope.login = function(){
		if ($scope.user.phone == '') {
			ionicToast.show('请输入您的手机号码。', 'middle', false, 1500);	
			return false;
		}
		if ($scope.user.password == '') {
			ionicToast.show('请输入密码。', 'middle', false, 1500);			
			return false;
		}		

		// qb service init
    	// QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, CONFIG);
    	qbUser.init();
		loginQBChat();

		var url = 'login';
		var data = {phone:$scope.user.phone, password:$scope.user.password};
		
		APIManager.get(url, data).then(function(res) {
			if (res.data.id == '0' || res.data.id == '-1') {
				ionicToast.show(res.data.message, 'middle', false, 1500);	
			} else {
				Session.setSession('user', res.data);
				if (window.RongCloudLibPlugin) {
					IMService.initRong(res.data.token);
					$interval(function() {
						RongCloudLibPlugin.getTotalUnreadCount(function(ret, err) {
							if(ret){
								$rootScope.uncount = ret.result;
								$rootScope.$apply();
							}
							
						})
					}, 1000);
				}
				$state.go('tab.home');
			}
		});
	};
	
	$scope.QQLogin = function(){
		var checkClientIsInstalled = 1;//default is 0,only for iOS
		$ionicLoading.show();
		YCQQ.ssoLogin(function(args){
			
			//alert(JSON.stringify(args));
			//alert(args.access_token);
			var url = 'thirdlogin';
			var data = {token:args.access_token};
			APIManager.get(url, data).then(function(res) {				
				$ionicLoading.hide();
				Session.setSession('user', res.data.user);
				if (window.RongCloudLibPlugin) {
					alert(res.data.user.token);
					IMService.initRong(res.data.user.token);
					$interval(function() {
						RongCloudLibPlugin.getTotalUnreadCount(function(ret, err) {
							if(ret){
								$rootScope.uncount = ret.result;
								$rootScope.$apply();
							}
							
						})
					}, 1000);
				}
				$state.go('tab.home');
			});
		   
		      },function(failReason){
		       //alert(failReason);
		},checkClientIsInstalled);
	}
	
	$scope.new_user = Session.getSession('new_user')	
	if (!$scope.new_user) {
		$scope.new_user = {
			phone : '', password : '', username:'', photo:{file_type:'',src:''}, gender : 1, birthday : '', job_id : 0, edu_id : 0, wage_id : 0, hobby: [], hobby_id : '', character_id : 0, stature_id : 0
		};
	}	
	
	// on page of register job, getting jobs
	if ($state.current.name == 'reg_job'){
		var url = 'get_fields';
		var data = {tbname:'jobs'};
		$ionicLoading.show();
		APIManager.get(url, data).then(function (res){
			$scope.jobs = res.data.fields;				
			$ionicLoading.hide();
		});
	}
	// on page of register_education, getting edus
	if ($state.current.name == 'reg_education'){
		var url = 'get_fields';
		var data = {tbname:'edus'};
		$ionicLoading.show();
		APIManager.get(url, data).then(function (res){
			$scope.edus = res.data.fields;				
			$ionicLoading.hide();
		});
	}
	// on page of register_wage, getting wages
	if ($state.current.name == 'reg_wage'){
		var url = 'get_fields';
		var data = {tbname:'wages'};
		$ionicLoading.show();
		APIManager.get(url, data).then(function (res){
			$scope.wages = res.data.fields;				
			$ionicLoading.hide();
		});
	}
	// on page of register_hobby, getting hobbies
	if ($state.current.name == 'reg_hobby'){
		var url = 'get_fields';
		var data = {tbname:'hobbies'};
		$ionicLoading.show();
		APIManager.get(url, data).then(function (res){
			$scope.hobbies = res.data.fields;
			if ($scope.new_user.hobby.length == 0) {
				var p = [];
				for(var i=0; i<$scope.hobbies.length; i++) {
					p.push({id:$scope.hobbies[i].id, checked:false});
				}
				$scope.new_user.hobby = p;
			}
			var p = [];
			for(var i=0; i<$scope.hobbies.length;i++) {
				p.push(isChecked(i));
			}
			$scope.cur_checked = p;
		});
		$ionicLoading.hide();
	}
	// on page of register_character, getting characters
	if ($state.current.name == 'reg_character'){
		var url = 'get_fields';
		var data = {tbname:'characters'};
		$ionicLoading.show();
		APIManager.get(url, data).then(function (res){
			$scope.characters = res.data.fields;
			$ionicLoading.hide();
		});
	}
	// on page of register_stature, getting statures
	if ($state.current.name == 'reg_stature'){
		var url = 'get_fields';
		var data = {tbname:'statures'};
		$ionicLoading.show();
		APIManager.get(url, data).then(function (res){
			$scope.statures = res.data.fields;
			$ionicLoading.hide();
		});
	}
	
	$scope.forgetpwd = function() {
		$state.go('forgetpwd');
	}
	
	$scope.register = function() {
		Session.clearSession('new_user');		
		$state.go('register');
	};
	
	$scope.nextToPassword = function(){
		if(!phonenumber($scope.new_user.phone)){
			ionicToast.show('手机号码格式不正确', 'middle', false, 1500);
			return;
		}
		
		if ($scope.new_user.phone == '') {
			ionicToast.show('请输入您的手机号码。', 'middle', false, 1500);			
			return false;
		} else {
			var url = 'check_phone';
			var data = {phone:$scope.new_user.phone};
			APIManager.get(url, data).then(function (res){
				if (res.data.code != '0') {
					ionicToast.show('该手机号码已被使用。', 'middle', false, 1500);
				} else {
					$scope.new_user.password = '';
					Session.setSession('new_user', $scope.new_user);
					$state.go('reg_password');
				}
			});
		}
		
    };
	
	$scope.nextToNickname = function(){
		if ($scope.new_user.password == '') {
			ionicToast.show('请输入密码。', 'middle', false, 1500);			
			return false;
		} else if ($scope.new_user.password.length < 4) {
			ionicToast.show('请输入密码至少4个字符。', 'middle', false, 1500);			
			return false;
		}
		$scope.new_user.username = '';
		$scope.new_user.photo = {file_type:'',src:''};
        Session.setSession('new_user', $scope.new_user);
        $state.go('reg_nickname');
    };
	
	$scope.nextToGender = function(){
		if ($scope.new_user.username == '') {
			ionicToast.show('请输入您的昵称。', 'middle', false, 1500);			
			return false;
		}
		$scope.new_user.gender = 1;
        Session.setSession('new_user', $scope.new_user);
        $state.go('reg_gender');
    };
	
	$scope.nextToBirthday = function(){
		$scope.new_user.birthday = '';
        Session.setSession('new_user', $scope.new_user);
        $state.go('reg_birthday');
    };	
	 
    $scope.nextToJob = function(is_skip){
		if (!is_skip) {
			$scope.new_user.job_id = 0;
			Session.setSession('new_user', $scope.new_user);
		}
        $state.go('reg_job');
    };
   
    $scope.nextToEducation = function(is_skip){
		if (!is_skip) {
			$scope.new_user.edu_id = 0;
			Session.setSession('new_user', $scope.new_user);
		}
        $state.go('reg_education');
    };
	
	$scope.nextToWage = function(is_skip){
		if (!is_skip) {
			$scope.new_user.wage_id = 0;
			Session.setSession('new_user', $scope.new_user);
		}
        $state.go('reg_wage');
    };
	
	$scope.nextToHobby = function(is_skip){
		if (!is_skip) {
			$scope.new_user.hobby = [];
			Session.setSession('new_user', $scope.new_user);
		}
        $state.go('reg_hobby');
    };
	
	$scope.selHobby = function(i) {
		$scope.new_user.hobby[i].checked = !$scope.new_user.hobby[i].checked;
		$scope.cur_checked[i] = isChecked(i);
	};
	
	function isChecked(i) {
		var id = $scope.new_user.hobby[i].id;
		var checked = false;
		for(var j=0; j<$scope.new_user.hobby.length; j++) {
			if (id == $scope.new_user.hobby[j].id) {
				checked = $scope.new_user.hobby[j].checked;
				break;
			}
		}
		return checked;
	}
	
	$scope.nextToCharacter = function(is_skip){
		if (!is_skip) {
			$scope.new_user.character_id = 0;
			Session.setSession('new_user', $scope.new_user);
		}
        $state.go('reg_character');
    };
	
	 
    $scope.nextToStature = function(is_skip){
		if (!is_skip) {
			$scope.new_user.stature_id = 0;
			Session.setSession('new_user', $scope.new_user);
		}
        $state.go('reg_stature');
    };
	
	$scope.nextToLogin = function(is_skip){
		if (!is_skip) {
			Session.setSession('new_user', $scope.new_user);
		}
		new_user_register();        
    };
    
	var new_user_register = function() {
		var user = $scope.new_user;
		var h = '';
		if (user.hobby.length > 0) {
			for(var i=0; i<user.hobby.length; i++) {
				if (user.hobby[i].checked) {
					if (h != '') h += ',';
					h += user.hobby[i].id;
				}
			}
			user.hobby_id = h;
		}
		delete user.hobby;
		var photo = user.photo;
		delete user.photo;		
		var url = 'register';

		// qb service init
    	QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, CONFIG);
		// register qbchat
		signupQBChat

		APIManager.post(url, user).then(function (res){
			if (res.data.code == 0) {
				ionicToast.show('失败注册。', 'middle', false, 1500);
			} else if (res.data.code == -1) {
				ionicToast.show('该手机号码已被使用。', 'middle', false, 1500);
			} else {
				if (photo && photo.src) {
					var id = res.data.code;
					var file_type = photo.file_type;
					var ext = file_type=='png'?'.png':'.jpg';
					var options = {
						fileKey: 'file',
						fileName: id + '_' + ext,
						chunkedMode: false,
						mimeType: 'image/'+file_type
					};					
					$cordovaFileTransfer.upload(APIManager.getApiUrl()+'upload_user_photo', photo.src, options).then(function(result){						
						ionicToast.show('成功注册。', 'middle', false, 1500);
						$timeout(function () {
							Session.clearSession('new_user');
							$state.go('login');
						}, 1500);
					});
				} else {
					ionicToast.show('成功注册。', 'middle', false, 1500);
					$timeout(function () {
						Session.clearSession('new_user');
						$state.go('login');
					}, 1500);
				}				
			}			
		});
	}
	
	$scope.takePhoto = function() {       
        $ionicActionSheet.show({			
            buttons: [
                { text: '相机' },
                { text: '图库' }
            ],
            cancelText: '关闭',
            cancel: function() {
                return true;
            },
            buttonClicked: function(index) {
                switch (index){
                    case 0:
                        appendByCamera();
                        break;
                    case 1:
						appendByGallery();
                        break;
                    default:
                        break;
                }
                return true;
            }
        });
    }    

    var appendByCamera = function(){
        var options = {
			quality: 75,
			destinationType: Camera.DestinationType.FILE_URI,//NATIVE_URI,//FILE_URI,//DATA_URL,
			sourceType: Camera.PictureSourceType.CAMERA,
			allowEdit: true,
			encodingType: Camera.EncodingType.JPEG,
			popoverOptions: CameraPopoverOptions,
			//targetWidth: 1000,
			//targetHeight: 1000,
			saveToPhotoAlbum: false
		}

        $cordovaCamera.getPicture(options).then(function (imageData) {
			$scope.new_user.photo.file_type = 'jpeg';
			$scope.new_user.photo.src = imageData;
		}, function (err) {
			// An error occured. Show a message to the user
		});		
    };
	
    var appendByGallery = function () {
        var options = {
			quality: 75,
			destinationType: Camera.DestinationType.FILE_URI,
			sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
			encodingType: Camera.EncodingType.PNG,//JPEG,
			popoverOptions: CameraPopoverOptions,
			saveToPhotoAlbum: false
		};

		$cordovaCamera.getPicture(options).then(function (imageData) {
			$scope.new_user.photo.file_type = 'png';
			$scope.new_user.photo.src = imageData;
		}, function (err) {
			// An error occured. Show a message to the user
		});		
    }
	
	window.addEventListener('native.keyboardshow', function(){
		document.body.classList.add('keyboard-open');
	});
	
	$ionicPlatform.registerBackButtonAction(function () {			
		Session.exitConfirm($scope);		
	},100);    
	$scope.verify = function(){
		if(!phonenumber($scope.findpwd.phone)){
			ionicToast.show('手机号码格式不正确', 'middle', false, 1500);
			return;
		}
		$scope.findpwd.source = Math.floor(Math.random()*90000) + 10000;
		$scope.findpwd.wait = 60;
		var o = document.getElementById('btnverify');
		time(o);
		var url = 'verify';
	
		var data = {phone:$scope.findpwd.phone,code:$scope.findpwd.source};
		
		APIManager.post(url, data).then(function (res){
			console.log(res);
			if(res.data.code == -100){
				ionicToast.show('不存在的用户', 'middle', false, 1500);
				$scope.findpwd.wait = 0;
				o.removeAttribute("disabled"); 
			}else if(res.data.code != 0){
				ionicToast.show('手机验证错误。请稍后再试试。', 'middle', false, 1500);
				$scope.findpwd.wait = 0;
				o.removeAttribute("disabled");  
			}
		});
	}
	
	$scope.nextChangePwd = function(){
		
		if(!$scope.findpwd.code){
			ionicToast.show('请输入验证码', 'middle', false, 1500);
			return;
		}
		if($scope.findpwd.wait > 0 && $scope.findpwd.code == $scope.findpwd.source){
			Session.setSession('new_password', $scope.findpwd.phone);
			$state.go('changepwd');
		}else{
			$scope.findpwd.code = '';
			ionicToast.show('验证码没有效。请再次输入。', 'middle', false, 1500);
		}
	}
	
	function phonenumber(inputtxt)  {  
		var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
		if(inputtxt.match(phoneno))
			return true;  
		else 
			return false;  
	}  
	function time(o) {  
        if ($scope.findpwd.wait == 0) {  
            o.removeAttribute("disabled");            
			$scope.findpwd.status = false;
            $scope.findpwd.caption = "发送";  
			o.innerHTML =  $scope.findpwd.caption;
            $scope.findpwd.wait = 60;  
        } else {  
            o.setAttribute("disabled", true);  
			$scope.findpwd.status = true;
            $scope.findpwd.caption = "(" + $scope.findpwd.wait + ")";  
			o.innerHTML =  $scope.findpwd.caption;
            $scope.findpwd.wait--;  
            setTimeout(function() {  
                time(o)  
            },  
            1000)  
        }  
    }
	$scope.go_state = function(state){
		$state.go(state);
	}
	$scope.changepwd = function(){
		if($scope.changpwd.password == '' || $scope.changpwd.confirm == ''){
			ionicToast.show('请输入密码', 'middle', false, 1500);
		}
		if($scope.changpwd.password != $scope.changpwd.confirm){
			ionicToast.show('确认密码不一枚', 'middle', false, 1500);
			$scope.changpwd.password = '';
			$scope.changpwd.confirm = '';
			return;
		}
		url = 'change_password';
		data = {username:Session.getSession('new_password'),password:$scope.changpwd.confirm};
		APIManager.get(url, data).then(function (res){			
			if (!res.data.code) {
				ionicToast.show('用户不存在', 'middle', false, 1500);
			}  else {
				ionicToast.show('重置密码成功了', 'middle', false, 1500);
				$state.go('login');
			}
		});	
	}

	// abchat signin and signup
	// function signup qb if user would be new.
    function signupQBChat() {
      if($scope.user.phone == null) {
        alert('please login in side menu');
        return;
      }
//      QB.createSession(function(err,result){
        var params = { login: $scope.user.phone, password: "happyboy", tag_list: ["dev"], full_name: $scope.user.phone };

        QB.users.create(params, function(err, user){
          if (user) {
            // success
            qbUser.setQbUser(user);
            // QBChatConnect();
            qbUser.qbConnect();
          } else  {
            alert('failed to register qbchat');
          }
        });
//      });
    }


    // log in qb as his userid
    function loginQBChat () {
      if($scope.user.phone == null) {
        alert('please login in side menu');
        return;
      }
      QB.createSession(function(err,result){
        var params = { login: $scope.user.phone, password: "happyboy" };

        QB.login(params, function(err, user){
          if (user) {
            // success
            qbUser.setQbUser(user);
			// QBChatConnect();  
			qbUser.qbConnect();       
          } else  {
            // error
            if(err.code == 401) {
              signupQBChat();
            } else {
              alert('failed to login qbchat');
            }
          }
        });
      });
    }

});
