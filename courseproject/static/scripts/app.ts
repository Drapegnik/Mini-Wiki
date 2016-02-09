/// <reference path="angular.d.ts"/>

class HttpHandlerService {
    httpService:ng.IHttpService;
    handlerUrl:string;

    constructor($http:ng.IHttpService) {
        this.httpService = $http;
    }

    useGetHandler(params:any):ng.IPromise< any > {
        var result:ng.IPromise< any > = this.httpService.get(this.handlerUrl, {params: params})
            .then((response:any):ng.IPromise< any > => this.handlerResponded(response, params));
        return result;
    }

    usePostHandler(params:any):ng.IPromise< any > {
        var result:ng.IPromise< any > = this.httpService.post(this.handlerUrl, params)
            .then((response:any):ng.IPromise< any > => this.handlerResponded(response, params));
        return result;
    }

    handlerResponded(response:any, params:any):any {
        response.data.requestParams = params;
        return response.data;
    }

} // HttpHandlerService class


'use strict';
class PublicationController {
    constructor($scope:ng.IScope,
                $http:ng.IHttpService) {
        this.http = new HttpHandlerService($http);
        this.scope = $scope;
        this.publications = [];
        this.viewProfile = false;
    }

    scope:ng.IScope;
    publications:any;
    viewProfile:boolean

    private http:HttpHandlerService;

    public setFilter(categoryId:number = 0, userId:number = 0) {
        this.http.handlerUrl = "publications/";
        var result:any = this.http.useGetHandler({
            "categoryId": categoryId,
            "userId": userId
        }).then((data) => this.fillPublication(data));

    }

    private fillPublication(data:any) {
        this.publications = data.publications;
        for (var iterartor in this.publications) {
            this.publications[iterartor].tag = this.publications[iterartor].tag.split(", ");
        }

    }

}
class dragAndDrop {
    constructor($scope:ng.IScope) {
        this.scope = $scope;
        this.maxFileSize = 5242880;
        this.fileReader = new FileReader();
        this.initFileReader(this);
        this.prevPhoto = "";
        this.file = null;
        this.changed = false;
    }

    dropzone:ng.IAugmentedJQuery;
    destination:ng.IAugmentedJQuery;
    scope:ng.IScope;
    file:File;
    maxFileSize:number;
    fileReader:FileReader;
    prevPhoto:string;
    changed:boolean;

    public init(dropzoneId:string, targetId:string) {
        this.dropzone = angular.element(dropzoneId);
        this.destination = angular.element(targetId);
        this.initDropzone(this);
        this.getPrevPhoto();
    }

    private initDropzone(thissObj:dragAndDrop) {
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
    }

    private initFileReader(thissObj:dragAndDrop) {
        var thisObj = this;
        this.fileReader.onload =  function (event) {
            thisObj.destination.attr('src', event.target.result);
        }
    }

    private getPrevPhoto() {
        this.prevPhoto = this.destination.attr('src');
    }
    public inverseParametrChanged(){
        this.changed = this.changed ? false : true
    }
}

class photoUploader extends dragAndDrop {
    constructor($scope:ng.IScope, $http:ng.IHttpService) {
        super($scope);
        this.http = new HttpHandlerService($http);
    }

    http:HttpHandlerService;

    public fillFileFromInput() {
        this.fileReader.readAsDataURL(this.file);
    }

    public applyChange(){

    }

    public cancelChange(){
        this.destination.attr('src', this.prevPhoto);
    }
}


var app = angular
    .module("app", [])
    .controller("PublicationController", ["$scope", "$http", PublicationController])
    .controller("dragAndDrop", ["$scope", dragAndDrop])
    .controller("photoUploader", ["$scope", "$http", photoUploader])


app.directive('onReadFile', function ($parse) {
    return {
        restrict: 'A',
        scope: false,
        link: function (scope, element, attrs) {
            var fn = $parse(attrs.onReadFile);

            element.on('change', function (onChangeEvent) {
                scope.$apply(function () {
                    scope.ctrl.file = element[0].files[0]
                    fn(scope);
                });
            });
        }
    };
})

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
})