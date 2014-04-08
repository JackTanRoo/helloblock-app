hbApp.factory("Account", function($q, $http, $location) {

  function Account(opts) {
    var self = this;
    self.User = {};
    self.User.email = opts.email;
    self.errors = [];
    self.submitting = false;
    self.endpoint = opts.endpoint;
    self.redirectTo = opts.redirectTo;
    self.errorMsg = opts.errorMsg;
  }

  Account.prototype.submit = function(payload) {
    var self = this
    self.submitting = true;

    $http.post(self.endpoint, payload).success(function(res) {
      $location.url(self.redirectTo);

      self.submitting = false;
    }).error(function(res) {
      self.errors.push(self.errorMsg);

      self.submitting = false;
    })
  }

  Account.validate = function() {
    var deferred = $q.defer();

    $http.post("/sessions/validate")
      .success(function(res) {
        deferred.resolve(res);
      }).error(function(res) {
        deferred.reject(res)
        $location.path("/account/signin")
      })

    return deferred.promise;

  }

  return Account;

})
