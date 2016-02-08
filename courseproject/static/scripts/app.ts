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
        console.log(this.publications);

    }

}
class dragAndDrop {
    constructor($scope:ng.IScope) {
        this.scope = $scope;
        this.maxFileSize = 5242880;
        this.fileReader = new FileReader();
        this.initFileReader(this);
        this.changed = false;
    }

    dropzone:JQuery;
    destination:JQuery;
    scope:ng.IScope;
    file:File;
    maxFileSize:number;
    fileReader:FileReader
    changed:boolean

    public init(dropzoneId:string, targetId:string) {
        this.dropzone = $(dropzoneId);
        this.destination = $(targetId);
        this.initDropzone(this);
    }

    private initDropzone(thisObj:dragAndDrop) {
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
            thisObj.fileReader.readAsDataURL(thisObj.file)
        };
    }

    private initFileReader(thisObj:dragAndDrop) {
        this.fileReader.onload = (function (event) {
            thisObj.destination.attr('src', event.target.result);
            thisObj.changed = true;
        })
    }
}
var app = angular
    .module("app", [])
    .controller("PublicationController", ["$scope", "$http", PublicationController])
    .controller("dragAndDrop", ["$scope", dragAndDrop]);