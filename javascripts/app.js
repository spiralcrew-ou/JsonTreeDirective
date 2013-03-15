'use strict';

var myApp = angular.module('myApp', []);

function AppCtrl($scope, Data) {
    $scope.data = {};

    $scope.loadProfiles = function () {
        Data.loadProfiles($scope.data);
    };

    $scope.setTreePath = function (path) {
        $scope.data.expandPath = path;
    }
}

myApp.factory('Data', ['$http', function ($http) {
    var loadProfiles = function (scope) {
        $http({
            method: 'POST',
            url: '/json/profiles.json'}).
            success(function (response) {
                scope.results = response;
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
            expandPath: '@',
            expand: '@'
        },
        link: function (scope, element, attrs) {
            var tree = null;

            scope.path = [];
            scope.expand = (angular.isDefined(attrs.expand) && attrs.expand === "true");

            var objectLength = function (obj) {
                var size = 0, key;
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) size++;
                }
                return size;
            };

            var traverse = function (data, parent, level) {
                tree = parent || "";
                tree += "<ul>";

                if (data) {
                    level++;

                    angular.forEach(data, function (value, key) {

                        if (angular.isObject(value)) {
                            var opened = (key === scope.path[level]) ? 'open' : '';
                            tree += "<li class='parent " + opened + "'><a href='#' ng-click='showChilds($event)'>" + key + "</a>";

                            if (angular.isArray(value)) {
                                tree += " [" + value.length + "]";
                            } else if (angular.isObject(value)) {
                                tree += " {" + objectLength(value) + "}";
                            }

                            return traverse(value, tree, level); // pass in current level
                        } else {
                            tree += "<li class='child'>" + key + ": " + "<em>" + value + "</em>";
                        }

                        tree += "</li>";
                    });

                } else {
                    level--; // going up
                }

                return tree += "</ul>";
            };

            var build = function (json) {
                return traverse(json, null, -1);
            };

            var expandAll = function () {
                angular.element(document.getElementsByClassName('parent')).toggleClass('open');
            };


            scope.showChilds = function ($event) {
                angular.element($event.target).parent().toggleClass('open');
                $event.preventDefault();
            };

            scope.expandAll = function ($event) {
                scope.expand = (scope.expand) ? false : true; // toggle state
                $event.preventDefault();
            };

            attrs.$observe('expandPath', function (path) {
                console.log(path);

                scope.path = (path) ? path.split('.') : [];
            });

            attrs.$observe('expand', function (val) {
                expandAll();
                scope.toggleTxt = (val) ? 'contract' : 'expand';
            });

            // init
            attrs.$observe('jsonTree', function (data) {
                if (angular.isDefined(data)) {
                    var jsonData = JSON.parse(data)

                    try {
                        var out = build(jsonData.results);
                        element.html("").append($compile(out)(scope).addClass('json-tree'));
                    }
                    catch (err) {
                        element.html("No valid JSON received! || I have to write some test...")
                    }
                }
            });
        }
    };
}]);