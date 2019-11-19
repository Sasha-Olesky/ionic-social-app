angular.module('starter.public', [])
.controller('publicCtrl', function($scope, $ionicActionSheet, $cordovaCamera, $cordovaFileTransfer, $ionicPlatform, Session, $ionicLoading, APIManager, ionicToast) {
   	
	Session.saveHistory();
	$ionicPlatform.registerBackButtonAction(function () {
		Session.goBack();		
	},100);
	
	var cur_index = 0;
    $scope.postdata = {
        description:'',
        address:Session.getSession('user').address,
        isaddress:false,
		photos:[]
    }
    $scope.submitArticle = function () {
        var url = 'insert_post';
		var userid = Session.getSession('user').id;
		var desc = $scope.postdata.description;
		if (desc == '') {
			ionicToast.show('请输入内容', 'middle', false, 1500);
			return false;
		}
		var address = Session.getSession('user').address;
		var is_address = $scope.postdata.isaddress?'1':'0';
        var data = {userid:userid, content:desc, address:address, is_address:is_address};
        $ionicLoading.show();		
		APIManager.post(url, data).then(function(res) {
			//image upload
			var id = res.data.id;
			if($scope.postdata.photos && $scope.postdata.photos.length>0){
				image_upload(id, 0);							
			} 
        });
    };
	
	var image_upload = function(id, index) {
		var item = $scope.postdata.photos[index];
		var file_type = item.file_type;
		var ext = file_type=='png'?'.png':'.jpg';
		var options = {
			fileKey: 'file',
			fileName: id + '_' + index + ext,
			chunkedMode: false,
			mimeType: 'image/'+file_type
		};
		$cordovaFileTransfer.upload(APIManager.getApiUrl()+'upload_post_img', item.src, options).then(function(result){
			if (index < $scope.postdata.photos.length-1) {
				image_upload(id, index+1);
			} else {
				$scope.postdata.description = '';
				$scope.postdata.isaddress = false;
				$scope.postdata.photos = [];
				$ionicLoading.hide();
				ionicToast.show('成功发送了。', 'middle', false, 1500);
			}
		});
	};
	
    $scope.exitPost = function(){
        Session.goBack();
    };
	$scope.del_image = function(i) {
		$scope.postdata.photos.splice(i,1);
	};
    $scope.images_list = [];
    
    $scope.takePic = function() {       
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
			//targetWidth: 1000,
			//targetHeight: 1000,
			popoverOptions: CameraPopoverOptions,
			saveToPhotoAlbum: false
		}

        $cordovaCamera.getPicture(options).then(function (imageData) {
			//$scope.postdata.photos.push({src:"data:image/jpeg;base64," + imageData});
			$scope.postdata.photos.push({file_type:'jpeg', src:imageData});			
		}, function (err) {
			// An error occured. Show a message to the user
		});		
    };
    var appendByGallery = function () {
        var options = {
			quality: 75,
			destinationType: Camera.DestinationType.FILE_URI,//NATIVE_URI,//DATA_URL,
			sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
			//allowEdit: true,
			encodingType: Camera.EncodingType.PNG,//JPEG,
			//targetWidth: 3000,
			//targetHeight: 3000,
			popoverOptions: CameraPopoverOptions,
			saveToPhotoAlbum: false
		};

		$cordovaCamera.getPicture(options).then(function (imageData) {
			//$scope.postdata.photos.push({src:"data:image/jpeg;base64," + imageData});
			$scope.postdata.photos.push({file_type:'png', src:imageData});			
		}, function (err) {
			// An error occured. Show a message to the user
		});		
    }
    $scope.$watch('postdata.description', function(newVal, oldVal) {
        if (newVal) {
			if(newVal.length > 140)
				$scope.postdata.description = oldVal;
		}

    });
});