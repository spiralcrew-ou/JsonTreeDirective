'use strict';

var myApp = angular.module('myApp', []);

function AppCtrl($scope, Data){
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

myApp.directive('jsonTree', ['$compile', function ($compile) {
    var directiveDefinitionObject = {
        replace: false,
        restrict: 'A',
        scope: {
            jsonData: '@jsonTree'
        },
        compile: function (element, attrs) {
            return {
                pre: function (scope, element, attrs) {
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

                    scope.build = function (json) {
                        if (json) return traverse(angular.fromJson(json));
                    };

                    scope.$watch('jsonData', function (newVal, oldVal) {
                        if (newVal != oldVal) {
                            var treeMarkup = scope.build(JSON.parse(newVal));
                            treeMarkup = angular.element(treeMarkup).prepend('<li><a href="#" ng-click="expandAll($event)">(expand all)</a></li>');

                            element.html("").append($compile(treeMarkup)(scope).addClass('json-tree'));
                        }
                    });

                    /*scope.$observe('jsonData', function(jsonStr) {
                        if (jsonStr) {
                            scope.jsonData = JSON.parse(scope.jsonData);
                            var markup = scope.build(scope.jsonData);
                            markup = angular.element(markup).prepend('<li><a href="#" ng-click="expandAll($event)">(expand all)</a></li>');
                            element.html("").append($compile(markup)(scope).addClass('json-tree'));
                        }
                    });*/
                },
                post: function (scope, element, attrs) {
                    scope.showChilds = function ($event) {
                        angular.element($event.target).parent().toggleClass('open');
                        $event.preventDefault();
                    };

                    scope.expandAll = function ($event) {
                        angular.element(document.getElementsByClassName('parent')).toggleClass('open');
                        $event.preventDefault();
                    };
                }
            };
        }
    };
    return directiveDefinitionObject;
}]);