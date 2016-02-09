/// <reference path="angular.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
    };
    return PublicationController;
})();
var dragAndDrop = (function () {
    function dragAndDrop($scope) {
        this.scope = $scope;
        this.maxFileSize = 5242880;
        this.fileReader = new FileReader();
        this.initFileReader(this);
        this.prevPhoto = "";
        this.file = null;
        this.changed = false;
    }
    dragAndDrop.prototype.init = function (dropzoneId, targetId) {
        this.dropzone = angular.element(dropzoneId);
        this.destination = angular.element(targetId);
        this.initDropzone(this);
        this.getPrevPhoto();
    };
    dragAndDrop.prototype.initDropzone = function (thissObj) {
        var thisObj = this;
        this.dropzone[0].ondragover = function () {
            thisObj.dropzone.addClass('hover');
            return false;
        };
        this.dropzone[0].ondragleave = function () {
            thisObj.dropzone.removeClass('hover');
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
    dragAndDrop.prototype.initFileReader = function (thissObj) {
        var thisObj = this;
        this.fileReader.onload = function (event) {
            thisObj.destination.attr('src', event.target.result);
        };
    };
    dragAndDrop.prototype.getPrevPhoto = function () {
        this.prevPhoto = this.destination.attr('src');
    };
    dragAndDrop.prototype.inverseParametrChanged = function () {
        this.changed = this.changed ? false : true;
    };
    return dragAndDrop;
})();
var photoUploader = (function (_super) {
    __extends(photoUploader, _super);
    function photoUploader($scope, $http) {
        _super.call(this, $scope);
        this.http = new HttpHandlerService($http);
    }
    photoUploader.prototype.fillFileFromInput = function () {
        this.fileReader.readAsDataURL(this.file);
    };
    photoUploader.prototype.applyChange = function () {
    };
    photoUploader.prototype.cancelChange = function () {
        this.destination.attr('src', this.prevPhoto);
    };
    return photoUploader;
})(dragAndDrop);
var app = angular
    .module("app", [])
    .controller("PublicationController", ["$scope", "$http", PublicationController])
    .controller("dragAndDrop", ["$scope", dragAndDrop])
    .controller("photoUploader", ["$scope", "$http", photoUploader]);
app.directive('onReadFile', function ($parse) {
    return {
        restrict: 'A',
        scope: false,
        link: function (scope, element, attrs) {
            var fn = $parse(attrs.onReadFile);
            element.on('change', function (onChangeEvent) {
                scope.$apply(function () {
                    scope.ctrl.file = element[0].files[0];
                    fn(scope);
                });
            });
        }
    };
});
app.directive('onSrcChanged', function ($parse) {
    return {
        restrict: 'A',
        scope: false,
        link: function (scope, element, attrs) {
            var fn = $parse(attrs.onSrcChanged);
            element.on('load', function (onChangeEvent) {
                console.log("Half");
                scope.$apply(function () {
                    fn(scope);
                });
            });
        }
    };
});
//# sourceMappingURL=app.js.map