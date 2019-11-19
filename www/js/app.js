// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'ionic-toast', 'ion-gallery', 'ionicLazyLoad', 'photo-viewer', 'starter.home', 'starter.dynamics','starter.account','starter.personal', 'starter.services','starter.login','starter.session','starter.search','starter.pletter','starter.alert','starter.public'])

.run(function($ionicPlatform, $state, Session, $http,$interval,$rootScope) {
	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)		
		if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);
		}

		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}
		
		if (Session.isLoggedIn()) {
			$state.go('tab.home');
			$interval(function() {
				RongCloudLibPlugin.getTotalUnreadCount(function(ret, err) {
					if(ret){
						$rootScope.uncount = ret.result;
						$rootScope.$apply();
					}
					if(err){
					
						IMService.initRong(res.data.token);
					}
				})
			}, 1000);
		} else {
			$state.go('login');
		}
	});
})

.config(function($ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom'); 		
})

.config(function(ionGalleryConfigProvider) {
	ionGalleryConfigProvider.setGalleryConfig({
		action_label: '关闭',
		template_gallery: 'gallery.html',
		template_slider: 'slider.html',
		toggle: false,
		row_size: 3,
		fixed_row_size: false
  });
})

.config(function($stateProvider, $urlRouterProvider) {
	
	$stateProvider
	
	.state('splash', {
		url: '/splash',    
		templateUrl: 'templates/home/splash.html'
	})

	/*======== main tab url ========*/
	.state('tab', {
		url: '/tab',    
		abstract: true,
		templateUrl: 'templates/tabs.html'		
	})
	.state('tab.home', {
		url: '/home',
		views: {
			'tab-home': {
				templateUrl: 'templates/home/index.html',
				controller: 'homeCtrl'
			}
		}
	})
	
	/*======== dynamics tab ========*/
	.state('tab.dynamics', {		
		url: '/dynamics',
		views: {
			'tab-dynamic': {
				templateUrl: 'templates/dynamics/index.html',
				controller: 'dynamicsCtrl'
			}
		}
	})
	.state('tab.dynamics.square', {		
		url: '/square',
		views: {
			'tab-dynamic-square': {
				templateUrl: 'templates/dynamics/square.html',
				controller: 'dynamicsCtrl'
			}
		}
	})
	.state('tab.dynamics.friend', {
		url: '/friend',
		views: {
			'tab-dynamic-friend': {
				templateUrl: 'templates/dynamics/friend.html',
				controller: 'dynamicsCtrl'
			}
		}
	})
	
	/*========= public tab ========*/
	.state('public', {
		cache : false,
		url: "/public",
		templateUrl     : "templates/public/index.html",
		controller      : 'publicCtrl'
	})	
	
	/*========= letter tab ========*/
	.state('tab.letter', {
		// cache: false,
		url: '/letter',
		views: {
			'tab-letter': {
				templateUrl: 'templates/letter/index.html',
				controller: 'pletterCtrl'
			}
		}
	})
	.state('tab.letter.receive', {
	 url: '/receive',
	 views: {
		 'tab-letter-receive': {
			 templateUrl: 'templates/letter/receive.html',
			 controller: 'pletterCtrl'
		 }
	 }
	})
	.state('tab.letter.send', {
		url: '/send',
		views: {
		 'tab-letter-send': {
			 templateUrl: 'templates/letter/send.html',
			 controller: 'pletterCtrl'
		 }
	 }
	})

	/*========= account tab ==========*/
	.state('tab.account', {
		cache : false,
		url: '/account',
		views: {
			'tab-account': {
				templateUrl: 'templates/account/index.html',
				controller: 'accountCtrl'
			}
		}
	})
	
	.state('edit_photo', {
		cache:false,
		url: '/edit_photo',
		templateUrl     : "templates/account/edit_photo.html",
		controller      : 'accountCtrl'		
	})
	
	.state('chatwith', {
		url: '/chatwith',
		params: { userid: 0,target: null,islike: 0 },
		templateUrl     : "templates/letter/chatwith.html",
		controller      : 'chatCtrl'
	})
	
	//login
	.state('login', {
		cache : false,
		url: "/login",
		templateUrl     : "templates/login/index.html",
		controller      : 'loginCtrl'
	})
	
	//Forget Password
	.state('forgetpwd', {
		cache : false,
		url: "/forgetpwd",
		templateUrl     : "templates/login/forgetpwd.html",
		controller      : 'loginCtrl'
	})
	
	.state('changepwd', {
		cache : false,
		url: "/changepwd",
		templateUrl     : "templates/login/changepwd.html",
		controller      : 'loginCtrl'
	})
	
	//Register
	.state('register', {
		cache : false,
		url: "/regphone",
		templateUrl     : "templates/login/register.html",
		controller      : 'loginCtrl'
	})
	.state('reg_password', {
		cache : false,
		url: "/reg_password",
		templateUrl     : "templates/login/reg_password.html",
		controller      : 'loginCtrl'
	})
	.state('reg_nickname', {
		cache : false,
		url: "/reg_nickname",
		templateUrl     : "templates/login/reg_nickname.html",
		controller      : 'loginCtrl'
	})
	.state('reg_gender', {
		cache : false,
		url: "/reg_gender",
		templateUrl     : "templates/login/reg_gender.html",
		controller      : 'loginCtrl'
	})
	.state('reg_job', {
		cache : false,
		url: "/reg_job",
		templateUrl     : "templates/login/reg_job.html",
		controller      : 'loginCtrl'
	})
	.state('reg_birthday', {
		cache : false,
		url: "/reg_birthday",
		templateUrl     : "templates/login/reg_birthday.html",
		controller      : 'loginCtrl'
	})
	.state('reg_education', {
		cache : false,
		url: "/reg_education",
		templateUrl     : "templates/login/reg_education.html",
		controller      : 'loginCtrl'
	})
	.state('reg_wage', {
		cache : false,
		url: "/reg_wage",
		templateUrl     : "templates/login/reg_wage.html",
		controller      : 'loginCtrl'
	})
	.state('reg_hobby', {
		cache : false,
		url: "/reg_hobby",
		templateUrl     : "templates/login/reg_hobby.html",
		controller      : 'loginCtrl'
	})
	.state('reg_character', {
		cache : false,
		url: "/reg_character",
		templateUrl     : "templates/login/reg_character.html",
		controller      : 'loginCtrl'
	})
	.state('reg_stature', {
		cache : false,
		url: "/reg_stature",
		templateUrl     : "templates/login/reg_stature.html",
		controller      : 'loginCtrl'
	})
	
	//Alert
	.state('alert', {
		url: "/alert",
		templateUrl     : "templates/alert/index.html",
		controller      : 'AlertCtrl'
	})
	.state('alert.notify', {
		url: '/notify',
		views: {
			'tab-alert-notify': {
				templateUrl: 'templates/alert/notify.html',
				controller: 'AlertCtrl'
			}
		}
	})
	
	//letter
	.state('alert.letter', {
		url: '/letter',
		views: {
			'tab-alert-letter': {
				templateUrl: 'templates/alert/letter.html',
				controller: 'AlertCtrl'
			}
		}
	})
	.state('alert.ignore', {
		url: '/ignore',
		views: {
			'tab-alert-ignore': {
				templateUrl: 'templates/alert/ignore.html',
				controller: 'AlertCtrl'
			}
		}
	})

	//Search
	.state('search', {
		url: "/search",
		templateUrl     : "templates/search/index.html",
		controller      : 'SearchCtrl'
	})
  
	//personal_information
	.state('personal_information', {
		cache: false,
		url: '/personal_information',
		templateUrl: 'templates/account/personal_information.html',
		controller: 'accountCtrl'
	})
	.state('personal_information.inner_monologue', {	  
		url: '/inner_monologue',
		views: {
			'tab-inner-monologue': {
				templateUrl: 'templates/account/personal_information/inner_monologue.html',
				controller: 'accountCtrl'
			}
		}
	})
	.state('personal_information.contact_information', {	  
		url: '/contact_information',
		views: {
			'tab-contact-information': {
				templateUrl: 'templates/account/personal_information/contact_information.html',
				controller: 'accountCtrl'
			}
		}
	})
	.state('personal_information.detail_information', {	  
		url: '/detail_information',
		views: {
			'tab-detail-information': {
				templateUrl: 'templates/account/personal_information/detail_information.html',
				controller: 'accountCtrl'
			}
		}
	})
	.state('personal_information.partner_condition', {	  
		url: '/partner_condition',
		views: {
			'tab-partner-condition': {
				templateUrl: 'templates/account/personal_information/partner_condition.html',
				controller: 'accountCtrl'
			}
		}
	})
	
	//agree
	.state('agree', {
		url: '/agree',
		templateUrl: 'templates/account/agree.html',
		controller: 'accountCtrl'
	})
	
	//call to meet
	.state('call_to_meet', {
		url: '/call_to_meet',
		templateUrl: 'templates/account/call_to_meet.html',
		controller: 'accountCtrl'
	})
	
	//follow
	.state('my_follows', {
		url: '/my_follows',
		abstract:true,
		templateUrl: 'templates/account/my_follows.html',
		controller: 'accountCtrl'
	})
	.state('my_follows.follow', {
		url: '/follow',
		views: {
			'tab-account-follow': {
				templateUrl: 'templates/account/my_follows/follow.html',
				controller: 'accountCtrl'
			}
		}
	})
	.state('my_follows.follow_me', {
		url: '/follow_me',
		views: {
			'tab-account-follow-me': {
				templateUrl: 'templates/account/my_follows/follow_me.html',
				controller: 'accountCtrl'
			}
		}
	})
	
	//dynamics
	.state('account_dynamics', {
		cache : false,
		url: '/account_dynamics',
		templateUrl: 'templates/account/dynamics.html',
		controller: 'accountCtrl'
	})
	
	//gift
	.state('my_gifts', {
		cache:false,
		abstract:true,
		url: '/my_gifts',
		templateUrl: 'templates/account/my_gifts.html',
		controller: 'accountCtrl'
	})
	.state('my_gifts.received', {
		url: '/received',
		views: {
			'tab-account-received': {
				templateUrl: 'templates/account/my_gifts/received.html',
				controller: 'accountCtrl'
			}
		}
	})
	.state('my_gifts.given', {
		url: '/given',
		views: {
			'tab-account-given': {
				templateUrl: 'templates/account/my_gifts/given.html',
				controller: 'accountCtrl'
			}
		}
	})	
	
	//settings
	.state('settings', {
		cache:false,
		url: '/settings',
		templateUrl: 'templates/account/settings.html',
		controller: 'accountCtrl'
	})
	.state('change_password', {
		cache:false,
		url: '/change_password',
		templateUrl: 'templates/account/settings/change_password.html',
		controller: 'accountCtrl'
	})
	.state('certification', {
		cache:false,
		url: '/certification',
		templateUrl: 'templates/account/settings/certification.html',
		controller: 'accountCtrl'
	})
	.state('online_service', {
		cache:false,
		url: '/online_service',
		templateUrl: 'templates/account/settings/online_service.html',
		controller: 'accountCtrl'
	})
	.state('about_us', {
		cache:false,
		url: '/about_us',
		templateUrl: 'templates/account/settings/about_us.html',
		controller: 'accountCtrl'
	})
	.state('privacy_settings', {
		cache:false,
		url: '/privacy_settings',
		templateUrl: 'templates/account/settings/privacy_settings.html',
		controller: 'accountCtrl'
	})
	
	//update membership
	.state('update_membership', {
		cache:false,
		url: '/update_membership',    
		templateUrl: 'templates/account/update_membership.html',
		controller: 'accountCtrl'
	})
	.state('vip_privilege', {
		cache:false,
		url: '/vip_privilege/:vip_days',
		templateUrl: 'templates/account/update_membership/vip_privilege.html',
		controller: 'accountCtrl'
	})
	.state('payment', {
		cache:false,
		url: '/payment/:vip_days',
		templateUrl: 'templates/account/update_membership/payment.html',
		controller: 'accountCtrl'    
	})
	
	//integral shop
	.state('integral_shop', {
		cache:false,
		url: '/integral_shop',
		templateUrl: 'templates/account/integral_shop.html',
		controller: 'accountCtrl'
	})
	.state('integral_shop.product_male', {
		url: '/product_male',
		views: {
			'tab-product-male': {
				templateUrl: 'templates/account/integral_shop/product.html',
				controller: 'accountCtrl'
			}
		}
	})
	.state('integral_shop.product_female', {
		url: '/product_female',
		views: {
			'tab-product-female': {
				templateUrl: 'templates/account/integral_shop/product.html',
				controller: 'accountCtrl'
			}
		}
	})
	.state('product_detail', {
		cache:false,
		url: '/product_detail/:product_id',
		templateUrl: 'templates/account/integral_shop/product_detail.html',
		controller: 'accountCtrl'
	})
	.state('buy_coins', {
		cache:false,
		url: '/buy_coins',
		templateUrl: 'templates/account/buy_coins.html',
		controller: 'accountCtrl'
	})
	.state('coin_payment', {
		cache:false,
		url: '/coin_payment/:coins',
		templateUrl: 'templates/account/buy_coins/payment.html',
		controller: 'accountCtrl'
	})
	
	//personal space
	.state('personal_space', {
		cache:false,
		url: '/personal_space/:id',
		templateUrl: 'templates/personal_space/index.html',
		controller: 'personalCtrl'
	})
	.state('personal_space.dynamics', {
		cache:false,
		url: '/dynamics',
		views: {
			'tab-dynamics': {
				templateUrl: 'templates/personal_space/dynamics.html',
				controller: 'personalCtrl'
			}
		}
	})
	.state('personal_space.profile', {
		cache:false,
		url: '/profile',
		views: {
			'tab-profile': {
				templateUrl: 'templates/personal_space/profile.html',
				controller: 'personalCtrl'
			}
		}	
	})
	
	.state('personal_call_to_meet', {
		url: '/personal_call_to_meet/:id',
		templateUrl: 'templates/personal_space/call_to_meet.html',
		controller: 'personalCtrl'
	})
	.state('video_chat', {
		cache:false,
		url: '/video_chat/:id',
		templateUrl: 'templates/personal_space/video_chat.html',
		controller: 'personalCtrl'
	})
	.state('present_shop', {
		cache:false,
		cache:false,
		url: '/present_shop/:id',
		templateUrl: 'templates/personal_space/present_shop.html',
		controller: 'personalCtrl'
	})
	.state('funny_game', {
		cache:false,
		url: '/funny_game/:id',
		templateUrl: 'templates/personal_space/funny_game.html',
		controller: 'personalCtrl'
	})
	.state('play_game', {
		cache:false,
		url: '/play_game/:id',
		templateUrl: 'templates/personal_space/play_game.html',
		controller: 'personalCtrl'
	});

	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/splash');

}).filter('trustHtml', function($sce) {

	return function(input) {

		return $sce.trustAsHtml(input);

	}

})
	
.controller('indexCtrl', function($scope, $state, $ionicPlatform, $window, Session, APIManager){
	
	$scope.onlineStatus = $window.navigator.onLine;	
	
	$scope.$watch('onlineStatus', function(online) {
        if (Session.isLoggedIn()) {
			var user = Session.getSession('user');
			var online_status = online?1:0;
			var url = 'set_online';
			var data = {userid:user.id, online:online_status};
			APIManager.get(url, data);
		}
    });	
	
	$window.addEventListener("online", function () {
        $scope.onlineStatus = true;
    }, true);

    $window.addEventListener("offline", function () {
        $scope.onlineStatus = false;
    }, true);
	
	$scope.cancel_exit = function() {
		Session.cancelExit();
	};
	
	$scope.app_exit = function() {
		Session.exitApp();
	};	
	
});
