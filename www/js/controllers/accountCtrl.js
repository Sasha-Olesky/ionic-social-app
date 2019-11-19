angular.module('starter.account', [])
.controller('accountCtrl', function($scope, $window, $state, $timeout, $ionicHistory, $ionicPlatform, $ionicScrollDelegate, $ionicPopup, $ionicLoading, $ionicActionSheet, $cordovaCamera, $cordovaFileTransfer, Session, APIManager, ionicToast){
	
	$scope.$on('$ionicView.beforeEnter', function() {	
		if(!Session.isLoggedIn()){
			$state.go('login', { param: 'account' });
		}
	});
	
	$scope.go_state = function(state) {				
		$state.go(state);
	};
	
	$scope.go_back = function() {		
		Session.goBack();
	};
	
	if ($state.current.name == 'tab.account'){
		$ionicHistory.clearHistory();
		Session.clearSession('history');
		$ionicHistory.clearCache(['my_follows.follow']);
		$ionicHistory.clearCache(['my_follows.follow_me']);
		$ionicHistory.clearCache(['call_to_meet']);
		$ionicHistory.clearCache(['agree']);
		
	}
	var states = ['tab.account', 'agree', 'call_to_meet', 'my_follows.follow', 'my_follows.follow_me', 'update_membership', 'account_dynamics', 'vip_privilege', 'payment', 'integral_shop.product_male', 'integral_shop.product_female', 'buy_coins', 'product_detail', 'coin_payment'];
	if (states.indexOf($state.current.name) !== -1) {
		Session.saveHistory();
	}
	
	$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){ 
		if (states.indexOf(toState.name) !== -1) {
			Session.saveHistory();
		}
	});
	
	$scope.user = Session.getSession('user');
	
	$scope.old_photo = $scope.user.photo;
	$scope.file_type = '';
	
	$scope.max_list_height = getMaxHeight(235);	
	$scope.max_list_height2 = getMaxHeight(140);
	$scope.max_list_height3 = getMaxHeight(90);	
	
	function getMaxHeight(offset) {
		return $window.innerHeight - offset
	}
	
	$scope.go_personal = function(id) {
		$state.go('personal_space',{id:id});
	}
	
	$ionicPlatform.registerBackButtonAction(function () {		
		var states1 = ['update_membership', 'account_dynamics', 'vip_privilege', 'payment', 'integral_shop.product_male', 'integral_shop.product_female', 'buy_coins', 'product_detail', 'coin_payment'];
		var states2 = ['agree', 'call_to_meet', 'my_follows.follow', 'my_follows.follow_me', 'personal_information', 'personal_information.inner_monologue', 'personal_information.detail_information', 'personal_information.contact_information', 'personal_information.partner_condition', 'my_gifts.received', 'my_gifts.given', 'settings'];
		
		if ($state.current.name == 'tab.account') {
			Session.exitConfirm($scope);
		} else if (states1.indexOf($state.current.name) !== -1) {
			Session.goBack();
		} else if (states2.indexOf($state.current.name) !== -1) {
			$state.go('tab.account');
		} else {
			navigator.app.backHistory();
		}
	},100);
	window.addEventListener('native.keyboardshow', keyboardShowHandler);
	window.addEventListener('native.keyboardhide', keyboardHideHandler);
	
	/*================ index page ==================*/
	if ($state.current.name == 'tab.account'){	
		
		var url = 'get_visitors';
		var data = {userid:$scope.user.id};
		$ionicLoading.show();
		APIManager.get(url, data).then(function (res){
			$scope.visitors = res.data.visitors;
			$scope.is_signed = res.data.is_signed;
			$ionicLoading.hide();
		});
		
		$scope.sleft=function() {
			$ionicScrollDelegate.scrollBy(-56, 0, true);
		};
		
		$scope.sright=function() {
			$ionicScrollDelegate.scrollBy(56, 0, true);
		};
		
		var mySign, mySuccess;
		$scope.signConfirm = function() {
			if ($scope.is_signed == 1) {
				ionicToast.show('您只能在24小时内登录一次。', 'middle', false, 1500);
			} else {
				mySign = $ionicPopup.show({					
					templateUrl: 'templates/account/sign_confirm.html',
					scope: $scope
				});
			}				
		};	

		$scope.signSuccess = function() {
			var url = 'sign';
			var data = {userid:$scope.user.id};
			$ionicLoading.show();
			APIManager.get(url, data).then(function (res){
				$ionicLoading.hide();
				$scope.is_signed = 1;
				mySign.close();
				mySuccess = $ionicPopup.show({					
					templateUrl: 'templates/account/sign_success.html',
					scope: $scope
				});
			});
		};
		
		$scope.sign_close = function() {
			if(mySign) mySign.close();
			if(mySuccess) mySuccess.close();
		};
		
		//logout
		$scope.logout = function(){
			Session.logout();
			console.log('lgout');
			$state.go('login');
		};
	}	
	
	/*=============== update username & photo ===============*/
	if ($state.current.name == 'edit_photo') {
		console.log('editphoto');
		$scope.save_photo = function() {
			var username = $scope.user.username;
			if (username == '') {
				ionicToast.show('请输入您的昵称。', 'middle', false, 1500);
				return false;
			}
			var url = 'update_username';
			var photo = 'blank';
			if ($scope.user.photo) photo = 'photo';
			var data = {userid:$scope.user.id, username:$scope.user.username, photo:photo};			
			APIManager.get(url, data).then(function (res){
				console.log(res);
				if ($scope.user.photo && $scope.user.photo !== $scope.old_photo) {
					var id = $scope.user.id;
					var file_type = $scope.file_type;
					var ext = file_type=='png'?'.png':'.jpg';
					var options = {
						fileKey: 'file',
						fileName: id + '_' + ext,
						chunkedMode: false,
						mimeType: 'image/'+file_type
					};
					$cordovaFileTransfer.upload(APIManager.getApiUrl()+'update_photo', $scope.user.photo, options).then(function(result){						
						ionicToast.show('成功保存。', 'middle', false, 1500);
						$scope.user.photo = APIManager.getUploadUrl() + 'photo/' + 'photo' + id + '_' + ext;
						Session.setSession('user', $scope.user);
					});
				} else {
					ionicToast.show('成功保存。', 'middle', false, 1500);
					if (photo == 'blank') {
						if ($scope.user.gender == 1) {
							$scope.user.photo = APIManager.getUploadUrl() + 'photo/default_male.jpg';
						} else {
							$scope.user.photo = APIManager.getUploadUrl() + 'photo/default_female.jpg';
						}
					}
					Session.setSession('user', $scope.user);
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
				$scope.file_type = 'jpeg';
				$scope.user.photo = imageData;
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
				$scope.file_type = 'png';
				$scope.user.photo = imageData;
			}, function (err) {
				// An error occured. Show a message to the user
			});		
		}
	}

	//******************** Update membership *********************
	if ($state.current.name == 'update_membership' || $state.current.name == 'vip_privilege' || $state.current.name == 'payment'){
		console.log('update_membership');			
		$scope.payment = {
			mode : 'alipay'
		}
		$scope.goPrivilege = function(days) {
			$state.go('vip_privilege', {vip_days:days});
		};
		
		$scope.vip = {
			days : $state.params.vip_days,
			privilege : [],
			cost : '0'
		}
		
		if (!$scope.vip.days) $scope.vip.days = '0';
		switch ($scope.vip.days) {
			case '30':
			$scope.vip.privilege = [true, true, false, false, false, false];
			$scope.vip.cost = '98';
			break;
			case '180':
			$scope.vip.privilege = [true, true, true, true, false, false];
			$scope.vip.cost = '198';
			break;
			case '365':
			$scope.vip.privilege = [true, true, true, true, true, true];
			$scope.vip.cost = '398';
			break;
			default:
			$scope.vip.privilege = [true, false, false, false, false, false];
			$scope.vip.cost = '0';
		}
		
		$scope.goPayment = function() {
			$state.go('payment', {vip_days:$scope.vip.days});
		};
		
		$scope.vip_pay = function() {
			if($scope.payment.mode == 'alipay'){
				var url = 'orderstring';
				var data = {userid:$scope.user.id, paytype:1,price:$scope.vip.cost,goods:0};
				APIManager.post(url, data).then(function (res){
					result = res.data.result;
					var orderString = '';
					orderString += 'partner="2088612807569222"';
					orderString += '&seller_id="2088612807569222"';
					orderString += '&out_trade_no="' + result.transaction_id + '"';
					orderString += '&subject="Ukiss吧"';
					orderString += '&body="升级账号，购买VIP权限"';
					orderString += '&total_fee="' + result.price + '"';
					orderString += '&notify_url="http://app.loveukiss.com/notify"';
					orderString += '&service="mobile.securitypay.pay"&payment_type="1"&_input_charset="utf-8"&it_b_pay="30m"&show_url="m.alipay.com"';
					orderString += '&sign="MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDDI6d306Q8fIfCOaTXyiUeJHkrIvYISRcc73s3vF1ZT7XN8RNPwJxo8pWaJMmvyTn9N4HQ632qJBVHf8sxHi/fEsraprwCtzvzQETrNRwVxLO5jVmRGi60j8Ue1efIlzPXV9je9mkjzOmdssymZkh2QhUrCmZYI/FCEa3/cNMW0QIDAQAB"&sign_type="RSA"';
				
					Alipay.pay({
						orderString:orderString
						},
						 function(msgCode){
							if(msgCode == 9000){
								var url = 'update_order_status';
								var data = {orderid:res.data.orderid,status:1};
								APIManager.get(url, data).then();
								var url = 'update_membership';
								var data = {userid:$scope.user.id, vip:$scope.vip.days};
								APIManager.get(url, data).then(function (res){
									ionicToast.show('成功支付', 'middle', false, 1500);
									$scope.user.membership = res.data.membership;
									Session.setSession('user', $scope.user);
									Session.goBack(-3);
								});
							}else if(msgCode == 6001){
								ionicToast.show('用户中途取消', 'middle', false, 1500);
							}else{
								ionicToast.show('支付失败', 'middle', false, 1500);
							}
						 },
						function(msg){
							ionicToast.show('支付失败', 'middle', false, 1500);
						}
					 );
				});
				
			}
			
		}
	}
	
	//******************** Buy Gold coins *********************
	if ($state.current.name == 'buy_coins' || $state.current.name == 'coin_payment'){
		console.log('buy_coins');
		$scope.payment = {
			mode : 'alipay'
		}
		$scope.gold_coins = {
			coins : $state.params.coins,
			cost : 0
		}
		if (!$scope.gold_coins.coins) $scope.gold_coins.coins = '0';
		switch ($scope.gold_coins.coins) {
			case '1500':		
			$scope.gold_coins.cost = '98';
			break;
			case '3000':
			$scope.gold_coins.cost = '198';
			break;
			case '6000':
			$scope.gold_coins.cost = '398';
			break;
			default:
			$scope.gold_coins.cost = '0';
		}
		
		$scope.goCoinPayment = function(coins) {
			$state.go('coin_payment', {coins:coins});
		};
		$scope.coins_pay = function() {
			if($scope.payment.mode == 'alipay'){
				var url = 'orderstring';
				var data = {userid:$scope.user.id, paytype:1,price:$scope.gold_coins.cost,goods:1};
				APIManager.post(url, data).then(function (res){
					result = res.data.result;
					var orderString = '';
					orderString += 'partner="2088612807569222"';
					orderString += '&seller_id="2088612807569222"';
					orderString += '&out_trade_no="' + result.transaction_id + '"';
					orderString += '&subject="Ukiss吧"';
					orderString += '&body="购买金币"';
					orderString += '&total_fee="' + result.price + '"';
					orderString += '&notify_url="http://app.loveukiss.com/notify"';
					orderString += '&service="mobile.securitypay.pay"&payment_type="1"&_input_charset="utf-8"&it_b_pay="30m"&show_url="m.alipay.com"';
					orderString += '&sign="MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDDI6d306Q8fIfCOaTXyiUeJHkrIvYISRcc73s3vF1ZT7XN8RNPwJxo8pWaJMmvyTn9N4HQ632qJBVHf8sxHi/fEsraprwCtzvzQETrNRwVxLO5jVmRGi60j8Ue1efIlzPXV9je9mkjzOmdssymZkh2QhUrCmZYI/FCEa3/cNMW0QIDAQAB"&sign_type="RSA"';
				
					Alipay.pay({
						orderString:orderString
						},
						 function(msgCode){
							if(msgCode == 9000){
								var url = 'update_order_status';
								var data = {orderid:res.data.orderid,status:1};
								APIManager.get(url, data).then();
								var url = 'update_coins';
								var data = {userid:$scope.user.id, coins:$scope.gold_coins.coins};
								APIManager.get(url, data).then(function (res){
									var new_coins = res.data.gold_coins;
									$scope.user.gold_coins = new_coins;
									Session.setSession('user', $scope.user);
									ionicToast.show('成功支付', 'middle', false, 1500);
									Session.goBack(-2);
								});
							}else if(msgCode == 6001){
								ionicToast.show('用户中途取消', 'middle', false, 1500);
							}else{
								ionicToast.show('支付失败', 'middle', false, 1500);
							}
						 },
						function(msg){
							ionicToast.show('支付失败', 'middle', false, 1500);
						}
					 );
				});
				
			}
			
		}
	}
	
	//******************** Personal Information - Monologue *********************
	if ($state.current.name == 'personal_information.inner_monologue'){
		console.log('inner_monologue');
		$scope.detail = {
			monologue : 0
		}
		var url = 'get_monologue';
		var data = {userid:$scope.user.id};
		$ionicLoading.show();
		APIManager.get(url, data).then(function (res){
			$scope.detail.monologue = res.data.monologue;
			$scope.conditions = res.data.conditions;			
			$ionicLoading.hide();
		});
		$scope.save_monologue = function() {
			var url = 'set_detail';
			var data = {userid:$scope.user.id, field:'monologue_id', value:$scope.detail.monologue};
			APIManager.get(url, data).then(function (res){
				ionicToast.show('成功保存', 'middle', false, 1500);
			});
		};
	}
	
	//******************** Personal Information - Detail Information *********************
	if ($state.current.name == 'personal_information.detail_information'){
		
		$scope.details = [];
		var url = 'get_details';
		var data = {userid:$scope.user.id};
		
		$ionicLoading.show();
		APIManager.get(url, data).then(function (res){			
			
			$scope.details = res.data.details;
			$scope.hobbies = res.data.hobbies;			
			$ionicLoading.hide();
		});
		$scope.save_details = function() {			
			var url = 'set_details';
			var data = {userid:$scope.user.id};
			$scope.details.forEach(function(item, index) {
				data[item.field] = item.value;
			});
			APIManager.post(url, data).then(function (res){
				ionicToast.show('成功保存', 'middle', false, 1500);
			});
		};
		var myHobbyConfirm, hobby_index;
		$scope.selHobby = function(hindex) {
			hobby_index = hindex;
			var hobby_id = $scope.details[hindex].value;
			var arr_hobby = hobby_id.split(',');
			$scope.hobbies.forEach(function(item, index){
				if (arr_hobby.indexOf(item.id) !== -1) {
					item.checked = true;
				} else {
					item.checked = false;
				}
			});
			myHobbyConfirm = $ionicPopup.show({					
				templateUrl: 'templates/account/personal_information/hobby_confirm.html',
				scope: $scope
			});
		};
		$scope.hobby_cancel = function() {
			myHobbyConfirm.close();
		};
		$scope.hobby_confirm = function() {
			var hobby_id = '', hobby_text = '';
			$scope.hobbies.forEach(function(item, index){
				if (item.checked) {
					if (hobby_id != '') {
						hobby_id += ','; hobby_text += ',';
					}
					hobby_id += item.id;
					hobby_text += item.hobby;
				}
			});
			if (hobby_text == '') hobby_text = '请选择...';
			$scope.details[hobby_index].value = hobby_id;
			$scope.details[hobby_index].hobby = hobby_text;
			myHobbyConfirm.close();
		};
	}
	
	//******************** Personal Information - Contact Information *********************
	if ($state.current.name == 'personal_information.contact_information'){
		console.log('contact_information');
		$scope.contact = {
			phone : {type: 'password', value : $scope.user.phone},
			qq : {type : 'password', value : $scope.user.qq}
		};
		var url = 'get_membership';
		var data = {userid:$scope.user.id};		
		APIManager.get(url, data).then(function (res){
			$scope.user.membership = res.data.membership;
			if ($scope.user.membership) {
				$scope.contact.phone.type = 'text';
				$scope.contact.qq.type = 'text';
			}			
		});
		$scope.save_contact = function() {
			if ($scope.contact.phone.value == '') {
				ionicToast.show('请输入您的手机号码。', 'middle', false, 1500);			
				return false;
			} else {
				url = 'check_phone2';
				data = {userid:$scope.user.id, phone:$scope.contact.phone.value};
				APIManager.get(url, data).then(function (res){
					if (res.data.code != '0') {
						ionicToast.show('该手机号码已被使用。', 'middle', false, 1500);
					} else {
						url = 'update_contact';
						var data = {userid:$scope.user.id, phone:$scope.contact.phone.value, qq:$scope.contact.qq.value};		
						APIManager.get(url, data).then(function (res){
							ionicToast.show('成功保存', 'middle', false, 1500);
							$scope.user.phone = $scope.contact.phone.value;
							$scope.user.qq = $scope.contact.qq.value;
							Session.clearSession('new_user');
							Session.setSession('user', $scope.user);
						});
					}
				});
			}
		};
		var myVip;
		$scope.upgradeMembership = function() {
			myVip = $ionicPopup.show({	
				cssClass : 'vip-popup-css',
				templateUrl: 'templates/personal_space/vip_confirm.html',
				scope: $scope
			});
		};		
		$scope.vip_cancel = function() {
			myVip.close();
		};
		$scope.vip_confirm = function() {			
			myVip.close();
			$state.go('update_membership');
		};
	}
	//******************** Personal Information - Partner Condition *********************
	if ($state.current.name == 'personal_information.partner_condition'){
		$scope.conditions = [];
		var url = 'get_partner_conditions';
		var data = {userid:$scope.user.id};
		$ionicLoading.show();
		APIManager.get(url, data).then(function (res){			
			$scope.conditions = res.data.conditions;	
			$ionicLoading.hide();
		});
		$scope.save_conditions = function() {			
			var url = 'set_conditions';
			var data = {userid:$scope.user.id};
			$scope.conditions.forEach(function(item, index) {
				data[item.field] = item.value;
			});
			APIManager.post(url, data).then(function (res){				
				ionicToast.show('成功保存', 'middle', false, 1500);
			});
		};
	}
	
	//******************** Product list *********************
	if ($state.current.name == 'integral_shop.product_male' || $state.current.name == 'integral_shop.product_female'){
		var mode = 1, page = 1;
		mode = $state.current.name == 'integral_shop.product_male'?1:0;
		$scope.products = [];
		var url = 'get_products';
		var data = {mode:mode, page:page};
		$ionicLoading.show();
		APIManager.get(url, data).then(function (res){			
			$scope.products = res.data.products;			
			$scope.more = res.data.is_more;			
			$ionicLoading.hide();
		});
		
		$scope.loadMore = function() {
			page++;
			url = 'get_products';
			data = {mode:mode, page:page};
			$ionicLoading.show();
			APIManager.get(url, data).then(function(res) {
				$scope.products = $scope.products.concat(res.data.products);
				$scope.$broadcast('scroll.infiniteScrollComplete');
				$scope.more = res.data.is_more;
				$ionicLoading.hide();
			});
		};
		
		$scope.doRefresh = function() {
			page = 1;
			var url = 'get_products';
			var data = {mode:mode, page:page};
			$ionicLoading.show();
			APIManager.get(url, data).then(function (res){			
				$scope.products = res.data.products;
				$scope.$broadcast('scroll.refreshComplete');
				$scope.more = res.data.is_more;
				$ionicLoading.hide();
			});
		};
	}
	
	//******************** Product detail *********************
	if ($state.current.name == 'product_detail'){
		var id = $state.params.product_id;
		var url = 'get_product';
		var data = {id:id};
		$ionicLoading.show();
		APIManager.get(url, data).then(function (res){			
			$scope.product = res.data;			
			$ionicLoading.hide();
		});
		var myBuy;
		$scope.buyConfirm = function() {
			
			if ($scope.user.gold_coins < parseInt($scope.product.integral)) {
				ionicToast.show('我的金币是不够的。', 'middle', false, 1500);
				return false;
			}
			myBuy = $ionicPopup.show({	
				cssClass : 'buy-popup-css',
				templateUrl: 'templates/account/integral_shop/buy_confirm.html',
				scope: $scope
			});
		};
		$scope.buy_cancel = function() {
			myBuy.close();
		};
		$scope.buy_confirm = function() {			
			var url = 'buy_with_integrals';
			var data = {userid:$scope.user.id, productid:$scope.product.id,coins:(-1)*$scope.product.integral};
			APIManager.get(url, data).then(function (res){	
				ionicToast.show('成功兑换', 'middle', false, 1500);
				$scope.user.gold_coins = res.data.gold_coins;
				Session.setSession('user', $scope.user);
				myBuy.close();
			});
		};		
	}
	
	//******************** I Follow *********************
	if ($state.current.name == 'my_follows.follow' || $state.current.name == 'my_follows.follow_me' ){
		var mode = $state.current.name == 'my_follows.follow'?1:0;
		
		var page = 1;
		$scope.follows = [];
		var url = 'get_follows';
		var data = {userid:$scope.user.id, mode:mode, page:page};
		$ionicLoading.show();
		APIManager.get(url, data).then(function (res){			
			$scope.follows = res.data.follows;
			follows = res.data.follows;
			$scope.more = res.data.is_more;			
			$ionicLoading.hide();
		});		
		
		$scope.loadMore = function() {
			page++;
			url = 'get_follows';
			data = {userid:$scope.user.id, mode:mode, page:page};
			$ionicLoading.show();
			APIManager.get(url, data).then(function(res) {
				$scope.follows = $scope.follows.concat(res.data.follows);
				$scope.$broadcast('scroll.infiniteScrollComplete');
				$scope.more = res.data.is_more;
				$ionicLoading.hide();
			});
		};	
		
		url = 'get_greetings';
		data = null;
		APIManager.get(url, data).then(function (res){			
			$scope.greetings = res.data.greetings;
		});
		var greetingPopup, to_userid, to_index;
		$scope.send_greeting = function(id, is_sent, t_index) {
			if (is_sent) {
				ionicToast.show('仅在24小时内打招呼一次。', 'middle', false, 1500);
			} else {
				to_userid = id;
				to_index = t_index
				greetingPopup = $ionicPopup.show({	
					cssClass : 'greeting-popup-css',
					templateUrl: 'templates/account/my_follows/greetings.html',
					scope:$scope
				});
			}
		};
		$scope.send_cancel = function() {
			greetingPopup.close();
		}		
		$scope.greeting_confirm = function(id) {						
			url = 'send_greeting';
			data = {userid:$scope.user.id, to_userid:to_userid, greeting_id:id, tbname:'follow_logs'};
			APIManager.get(url, data).then(function (res){			
				ionicToast.show('打招呼', 'middle', false, 1500);
				$scope.follows[to_index].is_sent = true;
				greetingPopup.close();
			});
		};
		
		$scope.doRefresh = function() {
			page = 1;
			url = 'get_follows';
			data = {userid:$scope.user.id, mode:mode, page:page};
			$ionicLoading.show();
			APIManager.get(url, data).then(function(res) {
				$scope.follows = res.data.follows;
				$scope.$broadcast('scroll.refreshComplete');
				$scope.more = res.data.is_more;
				$ionicLoading.hide();
			});
		};
	}
	
	//******************** Agree & Call to meet *********************
	if ($state.current.name == 'agree' || $state.current.name == 'call_to_meet' ){		
		var mode = $state.current.name == 'call_to_meet'?0:1;
		var page = 1;
		$scope.meets = [];
		var url = 'get_meets';
		var data = {userid:$scope.user.id, mode:mode, page:page};
		$ionicLoading.show();
		APIManager.get(url, data).then(function (res){			
			$scope.meets = res.data.meets;
			$scope.more = res.data.is_more;		
			$ionicLoading.hide();
		});
		$scope.loadMore = function() {
			page++;
			url = 'get_meets';
			data = {userid:$scope.user.id, mode:mode, page:page};
			$ionicLoading.show();
			APIManager.get(url, data).then(function(res) {
				$scope.meets = $scope.meets.concat(res.data.meets);
				$scope.$broadcast('scroll.infiniteScrollComplete');
				$scope.more = res.data.is_more;
				$ionicLoading.hide();
			});
		};	
		url = 'get_greetings';
		data = null;
		APIManager.get(url, data).then(function (res){			
			$scope.greetings = res.data.greetings;
		});
		var greetingPopup, to_userid, to_index, greeting_mode;
		$scope.send_greeting = function(g_mode, id, is_sent, t_index) {
			if (is_sent) {
				ionicToast.show('仅在24小时内打招呼一次。', 'middle', false, 1500);
			} else {
				to_userid = id;
				to_index = t_index
				greeting_mode = g_mode;
				greetingPopup = $ionicPopup.show({	
					cssClass : 'greeting-popup-css',
					templateUrl: 'templates/account/my_follows/greetings.html',
					scope:$scope
				});
			}
		};
		$scope.send_cancel = function() {
			greetingPopup.close();
		}		
		$scope.greeting_confirm = function(id) {						
			url = 'send_' + greeting_mode;
			data = {userid:$scope.user.id, to_userid:to_userid, greeting_id:id, tbname:'meet_logs'};
			APIManager.get(url, data).then(function (res){			
				ionicToast.show('打招呼', 'middle', false, 1500);
				if (greeting_mode == 'greeting')
					$scope.meets[to_index].is_sent = true;
				else 
					$scope.meets[to_index].is_replied = true;
				greetingPopup.close();
			});
		};
		
		$scope.doRefresh = function() {
			page = 1;
			url = 'get_meets';
			data = {userid:$scope.user.id, mode:mode, page:page};
			$ionicLoading.show();
			APIManager.get(url, data).then(function(res) {
				$scope.meets = res.data.meets;
				$scope.$broadcast('scroll.refreshComplete');
				$scope.more = res.data.is_more;
				$ionicLoading.hide();
			});
		};
	}
	
	//******************** Gift *********************
	if ($state.current.name == 'my_gifts.received' || $state.current.name == 'my_gifts.given' ){
		var mode = $state.current.name == 'my_gifts.received'?1:0;
		
		var page = 1;
		$scope.gifts = [];
		var url = 'get_gifts';
		var data = {userid:$scope.user.id, mode:mode, page:page};
		$ionicLoading.show();
		APIManager.get(url, data).then(function (res){			
			$scope.gifts = res.data.gifts;
			gifts = res.data.gifts;
			$scope.more = res.data.is_more;			
			$ionicLoading.hide();
		});
		$scope.loadMore = function() {
			page++;
			url = 'get_gifts';
			data = {userid:$scope.user.id, mode:mode, page:page};
			$ionicLoading.show();
			APIManager.get(url, data).then(function(res) {
				$scope.gifts = $scope.gifts.concat(res.data.gifts);
				$scope.$broadcast('scroll.infiniteScrollComplete');
				$scope.more = res.data.is_more;
				$ionicLoading.hide();
			});
		};
		
		$scope.doRefresh = function() {
			page = 1;
			var url = 'get_gifts';
			var data = {userid:$scope.user.id, mode:mode, page:page};
			$ionicLoading.show();
			APIManager.get(url, data).then(function(res) {
				$scope.gifts = res.data.gifts;
				$scope.$broadcast('scroll.refreshComplete');
				$scope.more = res.data.is_more;
				$ionicLoading.hide();
			});
		};
	}	
	
	//*************** Dynamics ***************
	if ($state.current.name == 'account_dynamics') {
		$scope.show_footer = false;
		var page = 1;
		$scope.posts = [];
		var url = 'get_post';
		var data = {userid:$scope.user.id, page:page};
		$ionicLoading.show();
		APIManager.get(url, data).then(function (res){			
			$scope.posts = res.data.posts;
			$scope.more = res.data.is_more;			
			$ionicLoading.hide();
		});
		$scope.loadMore = function() {
			page++;
			url = 'get_post';
			data = {userid:$scope.user.id, page:page};
			$ionicLoading.show();
			APIManager.get(url, data).then(function(res) {
				$scope.posts = $scope.meets.concat(res.data.posts);
				$scope.$broadcast('scroll.infiniteScrollComplete');
				$scope.more = res.data.is_more;
				$ionicLoading.hide();
			});
		};	
		var confirmPopup, post_id, index, click_send;
		var comment = document.getElementById('say_something');
		$scope.del_post = function(p_id, i) {
			post_id = p_id;
			index = i;
			confirmPopup = $ionicPopup.show({				
				templateUrl: 'templates/account/post_delete_confirm.html',
				scope:$scope
			});		
		};
		$scope.delete_cancel = function() {
			confirmPopup.close();
		}
		$scope.delete_confirm = function() {			
			url = 'delete_post';
			data = {postid:post_id, userid:$scope.user.id};
			APIManager.get(url, data).then(function (res){			
				$scope.posts.splice(index, 1);
				confirmPopup.close();
			});
		};
		$scope.start_comment = function(p_id, i) {
			post_id = p_id;
			index = i;
			$scope.show_footer = true;
			$timeout(function () {
				comment.focus();
				click_send = false;
			}, 0);
		};
		$scope.hide_say = function() {
			if (click_send) {
				comment.focus();
				click_send = false;
				return false;
			}
			$scope.show_footer = false;
		}
		$scope.send_comment = function() {			
			if (comment.value == '') {
				ionicToast.show('请输入内容', 'middle', false, 1500);
				click_send = true;
				return false;
			}
			url = 'insert_comment';
			data = {postid:post_id, userid:$scope.user.id, comment:comment.value};
			APIManager.post(url, data).then(function (res){
				$scope.posts[index].comments = res.data.comments;
				comment.value = '';
			});
		};
		function keyboardShowHandler(e){}
		function keyboardHideHandler(e){
			comment.blur();
			$scope.show_footer = false;
		}
		
		$scope.doRefresh = function() {
			page = 1;
			url = 'get_post';
			data = {userid:$scope.user.id, page:page};
			$ionicLoading.show();
			APIManager.get(url, data).then(function(res) {
				$scope.posts = res.data.posts;
				$scope.$broadcast('scroll.refreshComplete');
				$scope.more = res.data.is_more;
				$ionicLoading.hide();
			});
		};
	}
	
	//*************** Change password ***************
	if ($state.current.name == 'change_password') {
		$scope.pwd = {
			cur_password : '',
			new_password : '',
			confirm_password : ''
		}
		$scope.save_pwd = function() {
			if ($scope.pwd.cur_password == '') {
				ionicToast.show('请输入当前密码', 'middle', false, 1500);	
				return false;
			}
			if ($scope.pwd.new_password == '') {
				ionicToast.show('请输入新密码', 'middle', false, 1500);	
				return false;
			} else if ($scope.pwd.new_password.length < 4) {
				ionicToast.show('请输入密码至少4个字符。', 'middle', false, 1500);			
				return false;
			}
			if ($scope.pwd.confirm_password == '') {
				ionicToast.show('请确认密码', 'middle', false, 1500);	
				return false;
			} else if($scope.pwd.new_password != $scope.pwd.confirm_password){
				ionicToast.show('请正确确认密码', 'middle', false, 1500);
				return false;
			}
			url = 'update_password';
			data = {userid:$scope.user.id, cur_password:$scope.pwd.cur_password, password:$scope.pwd.new_password};
			APIManager.get(url, data).then(function (res){			
				if (!res.data.code) {
					ionicToast.show('保存失败', 'middle', false, 1500);
				} else if (res.data.code == -1) {
					ionicToast.show('请正确当前密码', 'middle', false, 1500);
				} else {
					ionicToast.show('保存成功', 'middle', false, 1500);
				}
			});		
		}		
	}
	
});