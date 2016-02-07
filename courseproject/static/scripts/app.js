/// <reference path="angular.d.ts"/>
var Filter = (function () {
    function Filter() {
    }
    return Filter;
})();
var HttpHandlerService = (function () {
    function HttpHandlerService($http) {
        this.httpService = $http;
    }
    HttpHandlerService.prototype.useGetHandler = function (params) {
        var _this = this;
        var result = this.httpService.get(this.handlerUrl, { params: params })
            .then(function (response) { return _this.handlerResponded(response, params); });
        return result;
    };
    HttpHandlerService.prototype.usePostHandler = function (params) {
        var _this = this;
        var result = this.httpService.post(this.handlerUrl, params)
            .then(function (response) { return _this.handlerResponded(response, params); });
        return result;
    };
    HttpHandlerService.prototype.handlerResponded = function (response, params) {
        response.data.requestParams = params;
        return response.data;
    };
    return HttpHandlerService;
})(); // HttpHandlerService class
'use strict';
var PublicationController = (function () {
    function PublicationController($scope, $http) {
        this.http = new HttpHandlerService($http);
        this.scope = $scope;
        this.filter = new Filter();
        this.publications = [];
    }
    PublicationController.prototype.setFilter = function (categoryId, userId) {
        var _this = this;
        if (categoryId === void 0) { categoryId = 0; }
        if (userId === void 0) { userId = 0; }
        this.http.handlerUrl = "publications/";
        var result = this.http.useGetHandler({
            "categoryId": categoryId,
            "userId": userId
        }).then(function (data) { return _this.fillPublication(data); });
    };
    PublicationController.prototype.fillPublication = function (data) {
        this.publications = data.publications;
        console.log(this.publications);
    };
    return PublicationController;
})();
var app = angular
    .module("app", [])
    .controller("PublicationController", ["$scope", "$http", PublicationController]);
//# sourceMappingURL=app.js.map