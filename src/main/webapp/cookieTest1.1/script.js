var app = angular.module('app', ['ngCookies']);

app.controller('mainCtrl', ['$scope', '$cookies',
  function($scope, $cookies) {
    var setCookieValue = function(key, value) {
      $cookies[key] = value;
    };
    
    $(window).on('beforeunload', function() {
    	setCookieValue('value1',$scope.v1);
    	
    });
    
    $scope.save = function(){
      setCookieValue('value1',$scope.v1);
    };
    
    $scope.getCookieValue = function(key){
      return $cookies[key];
    };
  }
]);