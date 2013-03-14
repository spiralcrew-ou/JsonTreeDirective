'use strict';

var myApp = angular.module('myApp', []);

function AppCtrl($scope, Data){
    $scope.openPath = 'results.profiles';

    $scope.loadProfiles = function () {
        Data.loadProfiles($scope);
    };
}

myApp.factory('Data', ['$http', function ($http) {
    var loadProfiles = function (scope) {
        $http({
            method:'POST',
            url:'/json/profiles.json'}).
            success(function (response) {
                scope.data = response;
            });
    };

    return {
        loadProfiles: loadProfiles
    };
}]);

myApp.directive('jsonTree', ['$compile', '$parse', function ($compile, $parse) {
    return {
        terminal: true,
        replace: false,
        restrict: 'A',
        scope: {
            jsonTree: '@',
            expandPath: '@'
        },
        link: function (scope, element, attrs) {
            var tree = null;

            var objectLength = function (obj) {
                var size = 0, key;
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) size++;
                }
                return size;
            };

            var traverse = function (data, parent) {
                tree = parent || "";
                tree += "<ul>";

                if (data) {
                    angular.forEach(data, function (value, key) {

                        if (angular.isObject(value)) {
                            tree += "<li class='parent'><a href='#' ng-click='showChilds($event)'>" + key + "</a>";

                            if (angular.isArray(value)) {
                                tree += " ["+value.length+"]";
                            } else if (angular.isObject(value)) {
                                tree += " {"+objectLength(value)+"}";
                            }

                            return traverse(value, tree);
                        } else {
                            tree += "<li class='child'>" + key + ": " + "<em>" + value + "</em>";
                        }

                        tree += "</li>";
                    });
                }

                return tree += "</ul>";
            };

            var build = function (json) {
                return traverse(json);
            };

            var expandAll = function () {
                angular.element(document.getElementsByClassName('parent')).toggleClass('open');
            };

            scope.expand = (angular.isDefined(attrs.expand) && attrs.expand === "true");

            scope.showChilds = function ($event) {
                angular.element($event.target).parent().toggleClass('open');
                $event.preventDefault();
            };

            scope.expandAll = function ($event) {
                scope.expand = (scope.expand) ? false : true; // toggle state
                $event.preventDefault();
            };

            attrs.$observe('expandPath', function(path) {
                if (path) {
                    // console.log(path);
                }
            });


            // init
            attrs.$observe('jsonTree', function (data) {
                if (data) {
                    try {
                        var out = build(JSON.parse(data));
                        out = angular.element(out).prepend('<li><a href="#" ng-click="expandAll($event)">({{toggleTxt}} all)</a></li>');

                        element.html("").append($compile(out)(scope).addClass('json-tree'));

                        scope.$watch('expand', function (newVal, oldVal) {
                            if (newVal || newVal !== oldVal) {
                                expandAll();
                            }

                            scope.toggleTxt = (newVal) ? 'contract' : 'expand';
                        });
                    }
                    catch(err) {
                        element.html("No valid JSON received! || I have to write some test...")
                    }
                }
            });
        }
    };
}]);