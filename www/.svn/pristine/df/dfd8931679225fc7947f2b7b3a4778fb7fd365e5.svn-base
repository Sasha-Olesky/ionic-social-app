(function(){
  'use strict';

  angular
    .module('photo-viewer',[])
    .directive('photoViewer', photoViewer);

  photoViewer.$inject = ['$ionicModal','$ionicPlatform','$timeout','$ionicScrollDelegate'];

  function photoViewer($ionicModal,$ionicPlatform,$timeout,$ionicScrollDelegate){

    controller.$inject = ["$scope"];
    return {
      restrict: 'A',
      controller: controller,
      link : link
    };

    function controller($scope){      
      var zoomStart = false;
      
      $scope.hideAll = false;	  
	  $scope.sel_photo = {src:''};

      $scope.showPhoto = function(src) {
		$scope.sel_photo.src = src;
		$scope.loadModal();
      };

      $scope.$on('ZoomStarted', function(e){
        $timeout(function () {
          zoomStart = true;
          $scope.hideAll = true;
        });

      });

      $scope.$on('TapEvent', function(e){
        $timeout(function () {
          _onTap();
        });

      });

      $scope.$on('DoubleTapEvent', function(event,position){
        $timeout(function () {
          _onDoubleTap(position);
        });

      });

      var _onTap = function _onTap(){

        if(zoomStart === true){
          $ionicScrollDelegate.$getByHandle('photo-viewer').zoomTo(1,true);

          $timeout(function () {
            _isOriginalSize();
          },300);

          return;
        }

        if(zoomStart === true){
          return;
        }

        $scope.hideAll = !$scope.hideAll;
      };

      var _onDoubleTap = function _onDoubleTap(position){
        if(zoomStart === false){
          $ionicScrollDelegate.$getByHandle('photo-viewer').zoomTo(3,true,position.x,position.y);
          zoomStart = true;
          $scope.hideAll = true;
        }
        else{
          _onTap();
        }
      };

      function _isOriginalSize(){
        zoomStart = false;
        _onTap();
      }

    }

    function link(scope, element, attrs) {
      var _modal;

      scope.loadModal = function(){
        $ionicModal.fromTemplateUrl('templates/personal_space/photo_viewer.html', {
          scope: scope,
          animation: 'fade-in'
        }).then(function(modal) {
          _modal = modal;
          scope.openModal();
        });
      };

      scope.openModal = function() {
        _modal.show();
      };

      scope.closeModal = function() {
        _modal.hide();
      };

      scope.$on('$destroy', function() {
        try{
          _modal.remove();
        } catch(err) {
          console.log(err.message);
        }
      });
    }
  }
})();
