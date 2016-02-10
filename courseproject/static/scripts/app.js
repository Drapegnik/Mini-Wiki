/// <reference path="angular.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var HttpHandlerService = (function () {
    function HttpHandlerService($http) {
        this.httpService = $http;
        this.config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
            }
        };
    }
    HttpHandlerService.prototype.useGetHandler = function (params) {
        var _this = this;
        var result = this.httpService.get(this.handlerUrl, { params: params })
            .then(function (response) { return _this.handlerResponded(response, params); });
        return result;
    };
    HttpHandlerService.prototype.usePostHandler = function (params) {
        var _this = this;
        var result = this.httpService.post(this.handlerUrl, params, this.config)
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
var UserProfile = (function () {
    function UserProfile($http) {
        this.http = new HttpHandlerService($http);
        this.testText = "(_!_)";
        this.profile = null;
    }
    UserProfile.prototype.getProfile = function (username) {
        var _this = this;
        this.http.handlerUrl = "getProfile/";
        this.http.useGetHandler({
            "username": username
        }).then(function (data) { return _this.fillUserProfile(data); });
    };
    UserProfile.prototype.fillUserProfile = function (data) {
        this.profile = data.profile[0];
        console.log(this.profile);
    };
    return UserProfile;
})();
var PublicationController = (function () {
    function PublicationController($scope, $http) {
        this.http = new HttpHandlerService($http);
        this.scope = $scope;
        this.publications = [];
        this.viewProfile = false;
        this.userProfile = new UserProfile($http);
    }
    PublicationController.prototype.setFilter = function (categoryId, username) {
        var _this = this;
        if (categoryId === void 0) { categoryId = 0; }
        if (username === void 0) { username = ""; }
        this.http.handlerUrl = "publications/";
        this.viewProfile = categoryId == 0;
        if (categoryId == 0) {
            this.userProfile.getProfile(username);
        }
        var result = this.http.useGetHandler({
            "categoryId": categoryId,
            "username": username
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
        this.inLoading = false;
    }
    dragAndDrop.prototype.init = function (dropzoneId, targetId) {
        this.dropzone = angular.element(dropzoneId);
        this.destination = angular.element(targetId);
        this.getPrevPhoto();
        this.initDropzone(this);
    };
    dragAndDrop.prototype.initDropzone = function (thisObj) {
        thisObj.dropzone[0].ondragleave = function () {
            thisObj.dropzone.removeClass('hover');
            return false;
        };
        thisObj.dropzone[0].ondragover = function () {
            thisObj.dropzone.addClass('hover');
            return false;
        };
        thisObj.dropzone[0].ondrop = function (event) {
            event.preventDefault();
            thisObj.dropzone.removeClass('hover');
            thisObj.dropzone.addClass('drop');
            thisObj.file = event.dataTransfer.files[0];
            if (thisObj.file.size > thisObj.maxFileSize) {
                thisObj.dropzone.text('File too big!');
                thisObj.dropzone.addClass('error');
                return false;
            }
            thisObj.fileReader.readAsDataURL(thisObj.file);
        };
    };
    dragAndDrop.prototype.initFileReader = function (thisObj) {
        this.fileReader.onload = function (event) {
            thisObj.destination.attr('src', event.target.result);
        };
    };
    dragAndDrop.prototype.getPrevPhoto = function () {
        this.prevPhoto = this.destination.attr('src');
    };
    dragAndDrop.prototype.inverseParameterChanged = function () {
        this.changed = !this.changed;
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
        var _this = this;
        this.http.handlerUrl = "updatePhoto/";
        var data = $.param({ photo_src: this.destination.attr('src') });
        this.changed = false;
        this.inLoading = true;
        this.http.usePostHandler(data)
            .then(function (data) { return _this.loadingFinished(); });
    };
    photoUploader.prototype.cancelChange = function () {
        this.destination.attr('src', this.prevPhoto);
    };
    photoUploader.prototype.loadingFinished = function () {
        this.inLoading = false;
    };
    return photoUploader;
})(dragAndDrop);
var app = angular
    .module("app", [])
    .config(function ($httpProvider) {
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
})
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
                scope.$apply(function () {
                    fn(scope);
                });
            });
        }
    };
});
//# sourceMappingURL=app.js.map