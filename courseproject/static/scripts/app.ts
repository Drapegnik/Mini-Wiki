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
        this.profile = null;
        this.achievements = [];
    }

    testText:string;
    private http:HttpHandlerService;
    profile:any;
    achievements:any;

    public getProfile(username:string) {
        this.http.handlerUrl = "getProfile/";
        this.http.useGetHandler({
            "username": username
        }).then((data) => this.fillUserProfile(data));
    }

    public fillUserProfile(data:any) {
        this.profile = data.profile[0];
        this.achievements = data.achievements;
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
        this.noPost = true;
    }

    scope:ng.IScope;
    publications:any;
    viewProfile:boolean;
    userProfile:UserProfile;
    tags:any;
    tagSearch:boolean;
    currentFilter:any;
    busy:boolean;
    noPost:boolean;

    private http:HttpHandlerService;

    public setFilter(categoryId:number = 0, username:string = "", tag = "", sortBy:string = "-rate") {
        this.http.handlerUrl = "publications/";
        this.viewProfile = username != "";
        if (username) {
            this.userProfile.getProfile(username);
        }
        this.currentFilter = {
            "categoryId": categoryId == 0 ? "" : categoryId,
            "author": username,
            "tag": tag,
            "sort_by": sortBy
        };
        this.publications = [];
        this.getPublications(0, 4);

    }

    public setSort(sort_by:string) {
        var filter = this.currentFilter;
        filter.categoryId = filter.category == "" ? 0 : filter.categoryId
        this.setFilter(filter.categoryId, filter.username, filter.tag, sort_by)
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

    public init(username:string = "") {
        this.setFilter(0, username)
    }

    private fillPublication(data:any) {
        for (var iterartor in data.publications) {
            data.publications[iterartor].tag = data.publications[iterartor].tag.split(", ");
            this.publications.push(data.publications[iterartor]);
        }
        if (data.publications.length != 0)
            this.busy = false;

        if (this.publications.length == 0)
            this.noPost = true;
        else
            this.noPost = false;
    }

    private getPublications(range_first:number, range_last:number) {
        var parameters:any = this.currentFilter;
        parameters.range_first = range_first;
        parameters.range_last = range_last;
        this.http.useGetHandler(parameters).then((data) => this.fillPublication(data));

    }

    public vote(pub_id:number, like:string) {
        this.http.handlerUrl = "vote/";
        this.http.usePostHandler($.param({publication: pub_id, like: like})).then((data) => this.applyVote(data));
    }

    private applyVote(data) {
        var publication = this.publications.filter(function (obj) {
            return obj.id == data.target;
        })[0];
        if (!isNaN(publication.like)) {
            if (publication.like == true)
                if (publication.like == data.like) {
                    publication.rate -= 1;
                }
                else {
                    publication.rate -= 2;
                }
            else if (publication.like == data.like) {
                publication.rate += 1;
            }
            else {
                publication.rate += 2;
            }
            publication.like = publication.like == data.like ? NaN : data.like;
        }
        else {
            publication.rate += data.like ? 1 : -1;
            publication.like = data.like;
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
        this.tags = [];
        this.autotags = [];
        this.category = "";
        this.http = new HttpHandlerService($http);
        this.errors = [];
        this.date = new Date();
        this.tagstring = "";
        this.sending = false;
        this.save_as = 0;
        this.author = "";
        this.tagIncorrect = true;
    }


    $scope:ng.IScope;
    $sce:ng.ISCEService;
    header:string;
    description:string;
    category:string;
    tags:any;
    htmlcontent:ng.IAugmentedJQuery;
    http:HttpHandlerService;
    errors:any;
    input:ng.IAugmentedJQuery;
    isBlank:Array<boolean> = [true, true];
    tagIncorrect:boolean;
    date:Date;
    autotags:any;
    tagstring:string;
    sending:boolean;
    save_as:number;
    author:string;


    public initPreview(htmlcontentId:string, dropzone:string, target:string, prev_data:any = [], author:string) {
        this.htmlcontent = angular.element(htmlcontentId);
        this.init(dropzone, target);
        this.category = "Biology";
        this.author = author;
        if (prev_data.length != 0) {
            this.fillPrevData(prev_data)
        }
    }

    private checkTags() {
        if (this.tags.length < 3 || this.tags.length > 5)
            this.tagIncorrect = true;
        else
            this.tagIncorrect = false;
    }

    fillPrevData(prev_data:any) {
        this.header = prev_data[0].header;
        this.description = prev_data[0].description;
        angular.element('#editor')[0].textContent = prev_data[0].body;
        this.destination.attr('src', prev_data[0].image);
        //  this.destination.attr('style', 'background-image: url('+prev_data[0].image+');');
        var tags = [];
        var tagsSpited = prev_data[0].tag.split(", ");
        for (var iter in tagsSpited)
            tags.push({text: tagsSpited[iter]})
        this.tags = tags;
        this.category = prev_data[0].category;
        this.save_as = prev_data[0].id;
        this.isBlank = [false, false];
        this.tagIncorrect = false;
    }

    public ShowPublication() {
        this.htmlcontent = this.$sce.trustAsHtml(CKEDITOR.instances.editor.getData());
    }

    public fillFileFromInput() {
        this.fileReader.readAsDataURL(this.file);
    }

    public submit(template_id) {
        if (!(this.isBlank[0] || this.isBlank[1] || this.sending || this.tagIncorrect)) {
            this.sending = true;
            var body = CKEDITOR.instances.editor.getData();
            for (var iter in this.tags)
                this.tagstring += this.tags[iter].text + ", ";
            var data = $.param({
                header: this.header,
                description: this.description,
                category: this.category,
                tagstring: this.tagstring,
                body: body,
                template_id: template_id,
                image: this.destination.attr('src'),
                save_as: this.save_as
            });
            this.http.handlerUrl = "makepublication/";
            this.http.usePostHandler(data).then((data)=>this.checkResponse(data));
        }
    }

    public checkResponse(data:any) {
        window.location = data.redirect;
    }

    public inputChange(id:string, index:number) {
        this.input = angular.element(id);
        if ($.trim(this.input.val()).length == 0) {
            this.input.val("");
            var mes = this.input.attr("name");
            this.input.attr("placeholder", gettext(mes + " can't be blank"));
            this.input.addClass("holdcol");
            this.isBlank[index] = true;
        }
        else
            this.isBlank[index] = false;
    }

    public loadTags($query) {
        this.http.handlerUrl = "getTags/";
        this.http.useGetHandler({substr: $query}).then((data) => this.autotags = data.tags);
        return this.autotags;
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
        this.isEdit = false;
        this.editcomment = "";
        this.editindex = -1;
        this.is_super = false;
        this.username = "";
        this.rate = 0;
        this.like = null;
    }

    scope:ng.IScope;
    interval:ng.IIntervalService;
    comments:any;
    publication_id:number;
    text:string;
    input:ng.IAugmentedJQuery;
    isBlank:boolean;
    isEdit:boolean;
    editcomment:string;
    editindex:number;
    is_super:boolean;
    username:string;
    rate:number;
    like:boolean;

    private http:HttpHandlerService;

    private getComments() {
        var data = {
            publication_id: this.publication_id
        };
        this.http.handlerUrl = "comments/";
        this.http.useGetHandler(data).then((data) => this.comments = data.comments);
    }

    public init(id, username, is_super, rate, like:string) {
        this.publication_id = id;
        this.username = username;
        this.is_super = is_super;
        this.rate = rate;
        if(like != 'None')
            this.like = like == 'True' ? true : false;
        else
            this.like = null;
        this.getComments();
    }

    public submit(publication_id) {
        if (!this.isBlank) {
            var data = $.param({
                publication_id: publication_id,
                text: this.text,
                edit: 'False'
            });
            this.http.handlerUrl = "createcomment/";
            this.http.usePostHandler(data).then((data) => this.getComments());
            this.input.val("");
        }
    }

    public inputChange(id:string) {
        this.input = angular.element(id);
        if ($.trim(this.input.val()).length == 0) {
            this.input.val("");
            this.input.attr("placeholder", gettext("Comment can't be empty"));
            this.input.addClass("holdcol");
            this.isBlank = true;
        }
        else
            this.isBlank = false;
    }

    public vote(comment_id:number, like:string, publication_id:number = 0) {
        this.http.handlerUrl = "vote/";
        if (comment_id)
            this.http.usePostHandler($.param({
                comment: comment_id,
                like: like
            })).then((data) => this.applyCommentVote(data));
        else
            this.http.usePostHandler($.param({
                publication: publication_id,
                like: like
            })).then((data) => this.applyPublicationVote(data));
    }

    private applyPublicationVote(data) {
        if (this.like !== null) {
            if (this.like == true)
                if (this.like == data.like) {
                    this.rate -= 1;
                }
                else {
                    this.rate -= 2;
                }
            else if (this.like == data.like) {
                this.rate += 1;
            }
            else {
                this.rate += 2;
            }
            this.like = this.like == data.like ? null : data.like;
        }
        else {
            this.rate += data.like ? 1 : -1;
            this.like = data.like;
        }
    }

    public edit(value, isOk, text, index, id) {
        this.editindex = index;
        if (isOk && !($.trim(this.editcomment).length == 0)) {
            this.http.handlerUrl = "createcomment/";
            this.http.usePostHandler($.param({
                comment: id,
                text: this.editcomment,
                edit: 'True'
            })).then((data) => this.getComments());
        }
        else {
            this.editcomment = text;
        }
        this.isEdit = value;
    }

    public deleteComment(id:string) {
        this.http.handlerUrl = "/deleteComment/" + id + '/'
        this.http.usePostHandler({}).then(()=>this.getComments());
    }

    private applyCommentVote(data) {
        var comments = this.comments.filter(function (obj) {
            return obj.id == data.target;
        })[0];
        if (comments.like !== null) {
            if (comments.like == true)
                if (comments.like == data.like) {
                    comments.rate -= 1;
                }
                else {
                    comments.rate -= 2;
                }
            else if (comments.like == data.like) {
                comments.rate += 1;
            }
            else {
                comments.rate += 2;
            }
            comments.like = comments.like == data.like ? null : data.like;
        }
        else {
            comments.rate += data.like ? 1 : -1;
            comments.like = data.like;
        }
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