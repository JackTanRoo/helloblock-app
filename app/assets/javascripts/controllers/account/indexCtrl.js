hbApp.controller("account/indexCtrl", function($scope, $http, $location) {

  $scope.tokens = [];
  $scope.errors = [];
  $scope.resetting = false;

  $scope.getTokens = function() {
    $http.get("/users/tokens")
      .success(function(data) {
        $scope.tokens = data.data;
        $scope.resetting = false;
      })
      .error(function(err) {
        $scope.errors.push("Something went wrong, please contact scott@helloblock.io")
        $scope.resetting = false;
      })
  }

  $scope.resetTokens = function() {
    $scope.resetting = true;
    $http.put("/users/tokens")
      .success(function(data) {
        $scope.getTokens()
      })
      .error(function(err) {
        $scope.errors.push("Something went wrong, please contact scott@helloblock.io")
        $scope.resetting = false;
      })
  }

  $scope.getTokens()

})
