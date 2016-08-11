var app = angular.module('app', []);
app.controller('AppController', ['$scope', '$http', function ($scope, $http) {
    $scope.user ={ custom:{} };;
    $scope.sendUser = function (model) {
		$scope.sending=true;
        $http.post('/register', model).then(function (result) {
            $scope.result = result.data;
			$scope.sending=false;
			if(result.data.Succeeded){
				$scope.user ={ custom:{} };
			}
		},function(config,err,status){
			console.log(config,err,status)
			$scope.result = {Errors:err||['unable to connect to server']};
			$scope.sending=false;
		});
    }
}]);