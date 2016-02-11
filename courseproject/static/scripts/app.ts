/// <reference path="angular.d.ts"/>

class HttpHandlerService {
    httpService:ng.IHttpService;
    handlerUrl:string;
    config:any;

    constructor($http:ng.IHttpService) {
        this.httpService = $http;
        this.config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
            }
        }
    }

    useGetHandler(params:any):ng.IPromise< any > {
        var result:ng.IPromise< any > = this.httpService.get(this.handlerUrl, {params: params})
            .then((response:any):ng.IPromise< any > => this.handlerResponded(response, params));
        return result;
    }

    usePostHandler(params:any):ng.IPromise< any > {
        var result:ng.IPromise< any > = this.httpService.post(this.handlerUrl, params, this.config)
            .then((response:any):ng.IPromise< any > => this.handlerResponded(response, params));
        return result;
    }

    handlerResponded(response:any, params:any):any {
        response.data.requestParams = params;
        return response.data;
    }

} // HttpHandlerService class


'use strict';
class UserProfile {
    constructor($http:ng.IHttpService) {
        this.http = new HttpHandlerService($http);
        this.testText = "(_!_)";
        this.profile = null;
    }

    testText:string;
    private http:HttpHandlerService;
    profile:any;

    public getProfile(username:string) {
        this.http.handlerUrl = "getProfile/";
        this.http.useGetHandler({
            "username": username
        }).then((data) => this.fillUserProfile(data));
    }

    public fillUserProfile(data:any) {
        this.profile = data.profile[0];
        console.log(this.profile);
    }

}


class PublicationController {
    constructor($scope:ng.IScope,
                $http:ng.IHttpService) {
        this.http = new HttpHandlerService($http);
        this.scope = $scope;
        this.publications = [];
        this.viewProfile = false;
        this.userProfile = new UserProfile($http);
    }

    scope:ng.IScope;
    publications:any;
    viewProfile:boolean;
    userProfile:UserProfile;

    private http:HttpHandlerService;

    public setFilter(categoryId:number = 0, username:string = "") {
        this.http.handlerUrl = "publications/";
        this.viewProfile = categoryId == 0;
        if (categoryId == 0) {
            this.userProfile.getProfile(username);
        }
        var result:any = this.http.useGetHandler({
            "categoryId": categoryId,
            "username": username
        }).then((data) => this.fillPublication(data));

    }

    private fillPublication(data:any) {
        this.publications = data.publications;
        for (var iterartor in this.publications) {
            this.publications[iterartor].tag = this.publications[iterartor].tag.split(", ");
        }

    }

}
class DragAndDrop {
    constructor($scope:ng.IScope) {
        this.scope = $scope;
        this.maxFileSize = 5242880;
        this.fileReader = new FileReader();
        this.initFileReader(this);
        this.prevPhoto = "";
        this.file = null;
        this.changed = false;
        this.inLoading = false;
    }

    dropzone:ng.IAugmentedJQuery;
    destination:ng.IAugmentedJQuery;
    scope:ng.IScope;
    file:File;
    maxFileSize:number;
    fileReader:FileReader;
    prevPhoto:string;
    changed:boolean;
    inLoading:boolean;

    public init(dropzoneId:string, targetId:string) {
        this.dropzone = angular.element(dropzoneId);
        this.destination = angular.element(targetId);
        this.getPrevPhoto();
        this.initDropzone(this);

    }

    private initDropzone(thisObj:DragAndDrop) {
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
    }

    private initFileReader(thisObj:DragAndDrop) {
        this.fileReader.onload = function (event) {
            thisObj.destination.attr('src', event.target.result);
        }
    }

    private getPrevPhoto() {
        this.prevPhoto = this.destination.attr('src');
    }

    public inverseParameterChanged() {
        this.changed = !this.changed;
    }
}

class PhotoUploader extends DragAndDrop {
    constructor($scope:ng.IScope, $http:ng.IHttpService) {
        super($scope);
        this.http = new HttpHandlerService($http);
    }

    http:HttpHandlerService;

    public fillFileFromInput() {
        this.fileReader.readAsDataURL(this.file);
    }

    public applyChange() {
        this.http.handlerUrl = "updatePhoto/";
        var data = $.param({photo_src: this.destination.attr('src')});
        this.changed = false;
        this.inLoading = true;
        this.http.usePostHandler(data)
            .then((data) => this.loadingFinished());
    }

    public cancelChange() {
        this.destination.attr('src', this.prevPhoto);

    }

    private loadingFinished() {
        this.inLoading = false;
    }
}

class TagController {
    constructor($scope:ng.IScope, $http:ng.IHttpService) {
        this.tags = [];
        this.http = new HttpHandlerService($http);
        this.http.handlerUrl = "getTags/"
        this.fontMax = 3;
        this.fontMin = 1;
    }

    tags:any;
    fontMin:number;
    fontMax:number;
    http:HttpHandlerService;

    public init() {
        this.http.useGetHandler({}).then((data) => this.fillTags(data));
    }

    public fillTags(data:any) {
        var max = -Infinity;
        var min = Infinity;
        for (var i in data.tags) {
            max = data.tags[i].count > max ? data.tags[i].count : max;
            min = data.tags[i].count < min ? data.tags[i].count : min;
        }
        for (var iter in data.tags) {
            var tag = data.tags[iter];
            var size = tag.count == min ? this.fontMin
                : (tag.count / max) * (this.fontMax - this.fontMin) + this.fontMin;
            this.tags.push({TagName: tag.name, Weight: Math.round(size)});
        }
        console.log(this.tags)
    }

}

class PreviewController {

    constructor($scope:ng.IScope, $sce:ng.ISCEService) {
        this.$scope = $scope;
        this.$sce = $sce;
        this.header = "Sample Header";
        this.description = "Sample Description";
        this.tags = "tags";
        this.category = "Sample Category";
    }
    $scope:ng.IScope;
    $sce:ng.ISCEService;
    header:string;
    description:string;
    category:string;
    tags:string;
    htmlcontent:ng.IAugmentedJQuery;


    public init(htmlcontentId:string) {
        this.htmlcontent = angular.element(htmlcontentId);
    }

    public ShowPublication(){
        this.htmlcontent = this.$sce.trustAsHtml(CKEDITOR.instances.editor.getData());
    }


}


var app = angular
    .module("app", [])
    .config(function ($httpProvider) {
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    })
    .controller("PublicationController", ["$scope", "$http", PublicationController])
    .controller("DragAndDrop", ["$scope", DragAndDrop])
    .controller("PhotoUploader", ["$scope", "$http", PhotoUploader])
    .controller("TagController", ["$scope", "$http", TagController])
    .controller("PreviewController", ["$scope", "$sce", PreviewController]);


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