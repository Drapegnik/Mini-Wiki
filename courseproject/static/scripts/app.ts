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
        this.currentFilter = {};
        this.busy = true;
    }

    scope:ng.IScope;
    publications:any;
    viewProfile:boolean;
    userProfile:UserProfile;
    tags:any;
    tagSearch:boolean;
    currentFilter:any;
    busy:boolean;

    private http:HttpHandlerService;

    public setFilter(categoryId:number = 0, username:string = "", tags = "", sortBy:string = "-rate") {
        this.http.handlerUrl = "publications/";
        this.viewProfile = username != "";
        if (username) {
            this.userProfile.getProfile(username);
        }
        this.currentFilter = {
            "categoryId": categoryId == 0 ? "" : categoryId,
            "username": username,
            "sort_by": sortBy
        };
        this.publications = [];
        this.getPublications(0, 4);
    }

    public addTag(tag:string) {
        var tags = this.currentFilter.tags;
        tags.push(tag);
        this.setFilter(0, "", tags, this.currentFilter.sort_by);
    }

    public loadMore() {
        this.busy = true;
        this.getPublications(this.publications.length, this.publications.length + 4);
    }

    public init() {
        this.setFilter()
    }

    private fillPublication(data:any) {
        for (var iterartor in data.publications) {
            data.publications[iterartor].tag = data.publications[iterartor].tag.split(", ");
            this.publications.push(data.publications[iterartor]);
        }
        if (data.publications.length != 0)
            this.busy = false;
        console.log(this.publications)
    }

    private getPublications(range_first:number, range_last:number) {
        var parameters:any = this.currentFilter;
        parameters.range_first = range_first;
        parameters.range_last = range_last;
        this.http.useGetHandler(parameters).then((data) => this.fillPublication(data));

    }

    public vote(pub_id:number,like:string){
        this.http.handlerUrl = "vote/";
        this.http.usePostHandler($.param({publication:pub_id,like:like})).then((data) => this.applyVote(data));
    }

    private applyVote(data){
        var publication = this.publications.filter(function(obj){
            return obj.id == data.target_id;
        })[0];
        console.log(data.like);
        publication.like = data.like;
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
    fileInput:ng.IAugmentedJQuery;
    scope:ng.IScope;
    file:File;
    maxFileSize:number;
    prevPhoto:string;
    changed:boolean;
    inLoading:boolean;
    fileReader:FileReader;

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
        this.http.handlerUrl = "getTags/";
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
    }

}

class PreviewController extends DragAndDrop {

    constructor($scope:ng.IScope, $sce:ng.ISCEService, $http:ng.IHttpService) {

        super($scope);
        this.$scope = $scope;
        this.$sce = $sce;
        this.header = "";
        this.description = "";
        this.tags = "";
        this.category = "";
        this.http = new HttpHandlerService($http);
        this.errors = [];
        this.data = new Date();
    }

    $scope:ng.IScope;
    $sce:ng.ISCEService;
    header:string;
    description:string;
    category:string;
    tags:string;
    htmlcontent:ng.IAugmentedJQuery;
    http:HttpHandlerService;
    errors:any;
    input:ng.IAugmentedJQuery;
    isBlank:Array<boolean> = [true, true, true];
    data:Date;


    public initPreview(htmlcontentId:string, dropzone:string, target:string) {
        this.htmlcontent = angular.element(htmlcontentId);
        this.init(dropzone, target);
    }

    public ShowPublication() {
        this.data = new Date();
        this.htmlcontent = this.$sce.trustAsHtml(CKEDITOR.instances.editor.getData());
    }

    public fillFileFromInput() {
        this.fileReader.readAsDataURL(this.file);
    }

    public submit(template_id) {
        if (!(this.isBlank[0] || this.isBlank[1] || this.isBlank[2])) {
            var body = CKEDITOR.instances.editor.getData();
            var data = $.param({
                header: this.header,
                description: this.description,
                category: this.category,
                tags: this.tags,
                body: body,
                template_id: template_id,
                image: this.destination.attr('src')
            });
            console.log(data);
            this.http.handlerUrl = "makepublication/";
            var response = this.http.usePostHandler(data).then((data)=>this.checkResponse(data));
        }
    }

    public checkResponse(data:any) {
        this.errors = data.errors
    }

    public inputChange(id:string, index:number) {
        this.input = angular.element(id);
        if ($.trim(this.input.val()).length == 0) {
            this.input.val("");
            var mes = this.input.attr("name");
            this.input.attr("placeholder", mes + " can't be blank");
            this.input.addClass("holdcol");
            this.isBlank[index] = true;
        }
        else
            this.isBlank[index] = false;
    }

}

class CommentsController {

    constructor($scope:ng.IScope, $http:ng.IHttpService, $interval:ng.IIntervalService) {
        this.http = new HttpHandlerService($http);
        this.scope = $scope;
        this.comments = [];
        this.isBlank = true;
        this.text = "";
        this.interval = $interval;
        this.interval(() => {
            this.getComments();
        }, 1500);
    }

    scope:ng.IScope;
    interval:ng.IIntervalService;
    comments:any;
    publication_id:number;
    text:string;
    input:ng.IAugmentedJQuery;
    isBlank:boolean;

    private http:HttpHandlerService;

    private getComments() {
        var data = {
            publication_id: this.publication_id
        };
        this.http.handlerUrl = "comments/";
        this.http.useGetHandler(data).then((data) => this.comments = data.comments);
    }

    public init(id) {
        this.publication_id = id;
        this.getComments();
        this.timeout(this.getComments, 50);
    }

    public submit(publication_id) {
        if (!this.isBlank) {
            var data = $.param({
                publication_id: publication_id,
                text: this.text
            });
            this.http.handlerUrl = "createcomment/";
            this.http.usePostHandler(data).then((data) => this.getComments())
        }
    }

    public inputChange(id:string) {
        this.input = angular.element(id);
        if ($.trim(this.input.val()).length == 0) {
            this.input.val("");
            this.input.attr("placeholder", "Comment can't be empty");
            this.input.addClass("holdcol");
            this.isBlank = true;
        }
        else
            this.isBlank = false;
    }
}

var app = angular
    .module("app", ['ngTagsInput', 'infinite-scroll'])
    .config(function ($httpProvider) {
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    })
    .controller("PublicationController", ["$scope", "$http", PublicationController])
    .controller("DragAndDrop", ["$scope", DragAndDrop])
    .controller("PhotoUploader", ["$scope", "$http", PhotoUploader])
    .controller("TagController", ["$scope", "$http", TagController])
    .controller("CommentsController", ["$scope", "$http", "$interval", CommentsController])
    .controller("PreviewController", ["$scope", "$sce", "$http", PreviewController]);


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