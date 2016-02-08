/// <reference path="angular.d.ts"/>
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
        this.publications = [];
        this.viewProfile = false;
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
        for (var iterartor in this.publications) {
            this.publications[iterartor].tag = this.publications[iterartor].tag.split(", ");
        }
        console.log(this.publications);
    };
    return PublicationController;
})();
var dragAndDrop = (function () {
    function dragAndDrop($scope) {
        this.scope = $scope;
        this.maxFileSize = 5242880;
        this.fileReader = new FileReader();
        this.initFileReader(this);
        this.changed = false;
    }
    dragAndDrop.prototype.init = function (dropzoneId, targetId) {
        this.dropzone = $(dropzoneId);
        this.destination = $(targetId);
        this.initDropzone(this);
    };
    dragAndDrop.prototype.initDropzone = function (thisObj) {
        this.dropzone[0].ondragover = function () {
            thisObj.dropzone.addClass('hover');
            return false;
        };
        this.dropzone[0].ondragleave = function () {
            this.dropzone.removeClass('hover');
            return false;
        };
        this.dropzone[0].ondrop = function (event) {
            event.preventDefault();
            thisObj.dropzone.removeClass('hover');
            thisObj.dropzone.addClass('drop');
            thisObj.file = event.dataTransfer.files[0];
            if (thisObj.file.size > thisObj.maxFileSize) {
                thisObj.dropzone.text('Файл слишком большой!');
                thisObj.dropzone.addClass('error');
                return false;
            }
            thisObj.fileReader.readAsDataURL(thisObj.file);
        };
    };
    dragAndDrop.prototype.initFileReader = function (thisObj) {
        this.fileReader.onload = (function (event) {
            thisObj.destination.attr('src', event.target.result);
            thisObj.changed = true;
        });
    };
    return dragAndDrop;
})();
var app = angular
    .module("app", [])
    .controller("PublicationController", ["$scope", "$http", PublicationController])
    .controller("dragAndDrop", ["$scope", dragAndDrop]);
//# sourceMappingURL=app.js.map