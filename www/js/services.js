angular.module('starter.services', [])

.factory('qbUser', function() {
    var qbUser = {};
    var qbObject ;
    var currentSession = {};
    var personal = {};   
        
    return {
        setQbUser : function(response){
            qbUser = response;
        },
        getUserID : function() {
            return qbUser.id;
        }, 
        init : function(){
            qbObject = QB;
            qbObject.init(QBApp.appId, QBApp.authKey, QBApp.authSecret, CONFIG);
        },
        getQBObject : function() {
            return qbObject;
        },
        qbConnect : function() {
            qbObject.chat.connect({
                jid: qbObject.chat.helpers.getUserJid( qbUser.id, QBApp.appId ),
                password: "happyboy"
            }, function(err, res) {
                if(err !== null) {
                    qbObject.chat.disconnect();
                } else {    
                    console.log('qbchat connection success');

                }
            });
        },
        setCurSesssion : function(session) {
            currentSession = session;
        }, 
        getCurSession : function() {
            return currentSession;
        }, 
        setPersonal : function(otherInfo) {
            personal = otherInfo;
        }, 
        getPersonal : function() {
            return personal;
        }
    };
})

.factory('APIManager', function($http) {
    var base_url = 'http://app.loveukiss.com/';
    var api_url = base_url + 'api/';
    var upload_url = base_url + 'upload/';
    
    var getPostParams = function ObjecttoParams(obj){
      var p = [];
      for (var key in obj){
        p.push('social_' + key + '=' + encodeURIComponent(obj[key]));
      }
      return p.join('&');
    };
    var getGetParams = function ObjecttoParams(obj){
      var p = [];
      for (var key in obj){
        p.push('social_' + key + '/' + encodeURIComponent(obj[key]));
      }
      return p.join('/');
    };
    
    return {
        post : function(url, param) {
            var link = api_url + url;
            return $http({
                method: 'POST',
                url: link,              
                data : getPostParams(param),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });         
        },
        get : function(url, param) {
            var link = api_url + url;
            if (param) link += '/' + getGetParams(param);
            return $http({
                method: 'GET',
                url: link,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });         
        },
        getBaseUrl : function() {
            return base_url;
        },
        getApiUrl : function() {
            return api_url;
        },
        getUploadUrl : function() {
            return upload_url;
        }
    }
    
})
.factory('Chats', function() {
        // Might use a resource here that returns a JSON array

        // Some fake testing data
        var chats = [{
            id: 0,
            name: 'Ben Sparrow',
            lastText: 'You on your way?',
            face: 'img/ben.jpg'
        }, {
            id: 1,
            name: 'Max Lynx',
            lastText: 'Hey, it\'s me',
            face: 'img/max.jpg'
        }, {
            id: 2,
            name: 'Adam Bradleyson',
            lastText: 'I should buy a boat',
            face: 'img/adam.jpg'
        }, {
            id: 3,
            name: 'Perry Governor',
            lastText: 'Look at my mukluks!',
            face: 'img/perry.jpg'
        }, {
            id: 4,
            name: 'Mike Harrington',
            lastText: 'This is wicked good ice cream.',
            face: 'img/mike.jpg'
        }, {
            id: 5,
            name: 'Mike Harrington',
            lastText: 'This is wicked good ice cream.',
            face: 'img/mike.jpg'
        }, {
            id: 6,
            name: 'Mike Harrington',
            lastText: 'This is wicked good ice cream.',
            face: 'img/mike.jpg'
        }, {
            id: 7,
            name: 'Mike Harrington',
            lastText: 'This is wicked good ice cream.',
            face: 'img/mike.jpg'
        }, {
            id: 8,
            name: 'Mike Harrington',
            lastText: 'This is wicked good ice cream.',
            face: 'img/mike.jpg'
        }];

        return {
            all: function() {
                return chats;
            },
            remove: function(chat) {
                chats.splice(chats.indexOf(chat), 1);
            },
            get: function(chatId) {
                for (var i = 0; i < chats.length; i++) {
                    if (chats[i].id === parseInt(chatId)) {
                        return chats[i];
                    }
                }
                return null;
            }
        };
    })
    .factory("IMService", ["$http", "$rootScope", function($http, $rootScope) {
        return {
            initRong: function(token) { //ôøã·ûùßÓ?
                RongCloudLibPlugin.init({
                        appKey: 'pkfcgjstpwkx8'
                    },
                    function(ret, err) {
                        if (ret) {
                            //   alert('init:' + JSON.stringify(ret));
                        }
                        if (err) {
                            //   alert('init error:' + JSON.stringify(err));
                        }
                    }
                );
                RongCloudLibPlugin.setConnectionStatusListener(
                    function(ret, err) {
                        if (ret) {
                            //  alert('setConnectionStatusListener:' + JSON.stringify(ret));
                            if (ret.result.connectionStatus == 'KICKED') {
                                alert('?îÜ??ì«î¤ÐìöâÓ®Ôô?!');
                                //  $state.go('login');
                            }
                        }
                        if (err) {
                            //   alert('setConnectionStatusListener error:' + JSON.stringify(err));
                        }
                    }
                );
                RongCloudLibPlugin.connect({
                        token: token
                    },
                    function(ret, err) {
                        if (ret) {
                            //    alert('connect:' + JSON.stringify(ret));  //ret.result.userId
                        }
                        if (err) {
                            //   alert('init error:' + JSON.stringify(err));
                        }
                    }
                );
                RongCloudLibPlugin.setOnReceiveMessageListener( //??á¼ãÓ
                    function(ret, err) {
                        if (ret) {
                            $rootScope.$broadcast('to-newmsg', JSON.stringify(ret.result.message));
                        }
                        if (err) {
                            //    alert('setOnReceiveMessageListener error:' + JSON.stringify(err));
                        }
                    }

                );

            },
            logout: function() { //÷Üõó
                RongCloudLibPlugin.logout(
                    function(ret, err) {
                        if (ret) {
                            //  console.log('logout:' + JSON.stringify(ret));
                        }
                        if (err) {
                            alert('logout error:' + JSON.stringify(err));
                        }
                    }
                );

            }
        };
    }])
    .factory("voiceService", function($q, $window, $timeout) {
        var recording,
            record,
            recordCanceled,
            file,
            maxLengthCheckTimeout;

        return {
            //?ã·?ëå
            startRecord: function(maxLength) {
                var defer = $q.defer();
                if (ionic.Platform.isIOS()) {
                    file = $window.cordova.file.documentsDirectory + Date.parse(new Date()) + ".wav";
                } else {
                    file = $window.cordova.file.externalApplicationStorageDirectory + Date.parse(new Date()) + ".amr";
                }

                record = new $window.Media(file,
                    function() {
                        if (recordCanceled) {
                            defer.reject({ reason: "canceled" });
                        } else {
                            defer.resolve(file);
                        }
                    },
                    function(error) {
                        defer.reject({ reason: "failed" });
                    }
                );
                record.startRecord();
                if (angular.isDefined(maxLength)) {
                    maxLengthCheckTimeout = $timeout(function exceedMaxLengthCallback() {
                        record.stopRecord();
                    }, maxLength * 1000);
                }
                return defer.promise;
            },
            getFile: function() {
                return file;
            },
            getRecord: function() {
                return record;
            },
            //ïÎò­?ëå
            stopRecord: function() {
                $timeout.cancel(maxLengthCheckTimeout);
                record.stopRecord();
            },
            //ö¢á¼?ëå
            cancelRecord: function() {
                $timeout.cancel(maxLengthCheckTimeout);
                recordCanceled = true;
                record.stopRecord();
                // TODO: ?ð¶ÙþËì
            },
            readAsArrayBuffer: function(path) {

                var defer = $q.defer();
                $window.resolveLocalFileSystemURL(path, function(entry) {
                    var reader = new $window.FileReader();
                    reader.onload = function(evt) {
                        defer.resolve(evt.target.result);
                    }
                    reader.onerror = function(evt) {
                        defer.reject();
                    };
                    entry.file(function(s) {
                        reader.readAsArrayBuffer(s);
                    });
                });
                return defer.promise;
            }
        };
    });
