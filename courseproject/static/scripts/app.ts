/// <reference path="angular.d.ts"/>
/// <reference path="types.ts"/>
class Filter {
    userId:number;
    //tags:any;
    category:number;
}


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
        this.filter = new Filter();
        this.publications = [];
    }

    scope:ng.IScope;
    filter:Filter;
    publications:any;

    private http:HttpHandlerService

    public setFilter(categoryId:number = 0, userId:number = 0) {
        this.http.handlerUrl = "publications/";
        var result:any = this.http.useGetHandler({
            "categoryId": categoryId,
            "userId": userId
        }).then((data) => this.fillPublication(data));

    }
    private fillPublication(data:any) {
        this.publications = data.publications;
        console.log(this.publications);
    }

}


var app = angular
    .module("app", [])
    .controller("PublicationController", ["$scope", "$http", PublicationController]);