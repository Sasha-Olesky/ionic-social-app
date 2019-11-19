angular.module('starter.session', [])
.factory('Session', function (APIManager, $state, $ionicPopup) {
	var setSession = function(name, value) {
		if (window.localStorage[name]) {
			window.localStorage.removeItem(name);
		}
		window.localStorage[name] = JSON.stringify(value);
	};
	var getSession = function(name) {
		var val = null;
		if (window.localStorage[name]) {
			val = JSON.parse(window.localStorage[name]);
		}
		return val;
	};
	var clearSession = function(name) {
		if (window.localStorage[name]) {
			window.localStorage.removeItem(name);
		}
	};
	var exit_confirm;
    return {
		setSession : setSession,
		getSession : getSession,
		clearSession : clearSession,
        isLoggedIn: function () {
			var _user = getSession('user');
			if (!_user) {
				return false;
			} else {
				var url = 'is_login';
				var data = {userid:_user.id};
				APIManager.get(url, data).then(function(res) {
					//console.log(res);
					if (!res.data.user) {
						clearSession('user');
						return false;
					} else {
						setSession('user', res.data.user);
						return true;
					}
				});
			}
            return _user ? true : false;
        },
        logout: function () {
			var user = getSession('user');
            var url = 'set_online';
			var data = {userid:user.id, online:0};
			APIManager.get(url, data);
			clearSession('user');
			clearSession('list_dependents');
        },
		saveHistory : function() {
			var state = {
				state_name : $state.current.name,
				params : $state.params
			};
			var h = getSession('history');
			if (!h) {
				h = [state];
				setSession('history', h);
			} else {
				var last = h[h.length-1];
				if (!angular.equals(last,state)) {
					if ((last.state_name=='my_follows.follow' && state.state_name == 'my_follows.follow_me') || (last.state_name=='my_follows.follow_me' && state.state_name == 'my_follows.follow') || (last.state_name=='integral_shop.product_male' && state.state_name == 'integral_shop.product_female') || (last.state_name=='integral_shop.product_female' && state.state_name == 'integral_shop.product_male')) {
						h.splice(h.length-1,1);
					}
					h.push(state);
					setSession('history', h);
				}
			}				
		},
		goBack : function(step) {
			if (typeof step === 'undefined' || step === null || step == 0) step = -1;
			var h = getSession('history');
			h.splice(h.length+step, -step);
			var index = h.length-1;
			var state_name = h[index].state_name;
			var params = h[index].params;
			setSession('history', h);			
			$state.go(state_name, params);
		},
		exitConfirm : function($scope) {
			exit_confirm = $ionicPopup.show({					
				templateUrl: 'templates/home/exit_confirm.html',
				scope: $scope
			});
		},
		cancelExit : function() {
			exit_confirm.close();
		},
		exitApp : function() {
			exit_confirm.close();
			navigator.app.exitApp();
		}
    }
});