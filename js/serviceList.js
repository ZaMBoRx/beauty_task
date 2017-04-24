angular.module("serviceList", [])
    .filter("range", function($filter) {
        return function(data, page, size) {
            if (angular.isArray(data) && angular.isNumber(page) && angular.isNumber(size)) {
                var start_index = (page - 1) * size;
                if (data.length < start_index) {
                    return [];
                } else {
                    return $filter("limitTo")(data.splice(start_index), size);
                }
            } else {
                return data;
            }
        }
    })
    
    .filter("pageCount", function() {
        return function(data, size) {
            if (angular.isArray(data)) {
                var result = [];
                for (var i = 0; i < Math.ceil(data.length / size); i++) {
                    result.push(i);
                }
                return result;
            } else {
                return data;
            }
        }
    })
    
    .filter("regularForm", function() {
        return function(input) {
            return input.charAt(0).toUpperCase() + input.substr(1).replace(/[A-Z]/g, ' $&');
        }
    })
    
    .directive("ngMobileClick", [function () {
        return function(scope, elem, attrs) {
            elem.bind("touchstart click", function(e) {
                e.preventDefault();
                e.stopPropagation();
            
                scope.$apply(attrs["ngMobileClick"]);
            });
        };
    }])
    
    .directive("dateTimePicker", function() {
        return {
            restrict: "A",
            require : "ngModel",
            link    : function(scope, element, attrs, ngModelCtrl) {
                var parent = $(element).parent();
                var dtp = parent.datetimepicker({
                    format: "DD.MM.YYYY hh:mm",
                });
                dtp.on("dp.change", function(e) {
                    ngModelCtrl.$setViewValue(moment(e.date).format("DD.MM.YYYY hh:mm"));
                    scope.$apply();
                });
            }
        };
    })
    
    .constant("serviceListActivePage", "active")
    .constant("serviceListPageCount", 5)
    .controller("serviceController", function($scope, $http, serviceListPageCount, serviceListActivePage) {
        var url = "js/sluzba.json";
        
        $http.get(url)
            .then(function(response) {
                for (var i = 0; i < response.data.length; i++) {
                    var date = response.data[i].dateOfBirth;
                    
                    var arrayDate = date.split(".");
                    
                    if (arrayDate[0].charAt(0) != 0 && arrayDate[0] < 10) {
                        arrayDate[0] = "0" + arrayDate[0];
                    }
                    if (arrayDate[1].charAt(0) != 0 && arrayDate[1] < 10) {
                        arrayDate[1] = "0" + arrayDate[1];
                    }
                    var backToArray = arrayDate.toString().replace(/\,/g, '.');
                    response.data[i].dateOfBirth = backToArray;
                }
                $scope.service = response.data;
            });
        
        $scope.column = 'id';
        $scope.reverse = false;
        
        $scope.sortColumn = function(col) {
            $scope.column = col;
            if ($scope.reverse) {
                $scope.reverse = false;
            } else {
                $scope.reverse = true;
            }
        }
        
        $scope.serviceListPageCount = 5;
        $scope.selectedPage = 1;
        $scope.pageSize = serviceListPageCount;
        
        $scope.selectPage = function(newPage) {
            $scope.selectedPage = newPage;
        }
        
        $scope.getPageClass = function(page) {
            return $scope.selectedPage == page ? serviceListActivePage : "";
        }
        
        $scope.searchFilter = function() {
            var result = {};
            if ($scope.filterList === undefined) {
                $scope.filterList = "$";
            }
            result[$scope.filterList] = $scope.searchTerm;
            
            if ($scope.filterList == "dateOfBirth") {
                $scope.isData = true;
            } else {
                $scope.isData = false;
            }
            
            return result;
        }
        
        $scope.serviceKeys = ["id", "firstName", "lastName", "dateOfBirth", "function", "experience"];
    });