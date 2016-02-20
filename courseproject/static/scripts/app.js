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
        this.profile = null;
        this.achievements = [];
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
        this.achievements = data.achievements;
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
        this.currentFilter = {};
        this.busy = true;
        this.noPost = true;
    }
    PublicationController.prototype.setFilter = function (categoryId, username, tag, sortBy) {
        if (categoryId === void 0) { categoryId = 0; }
        if (username === void 0) { username = ""; }
        if (tag === void 0) { tag = ""; }
        if (sortBy === void 0) { sortBy = "-rate"; }
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
    };
    PublicationController.prototype.setSort = function (sort_by) {
        var filter = this.currentFilter;
        filter.categoryId = filter.category == "" ? 0 : filter.categoryId;
        this.setFilter(filter.categoryId, filter.username, filter.tag, sort_by);
    };
    PublicationController.prototype.addTag = function (tag) {
        var tags = this.currentFilter.tags;
        tags.push(tag);
        this.setFilter(0, "", tags, this.currentFilter.sort_by);
    };
    PublicationController.prototype.loadMore = function () {
        this.busy = true;
        this.getPublications(this.publications.length, this.publications.length + 4);
    };
    PublicationController.prototype.init = function (username) {
        if (username === void 0) { username = ""; }
        this.setFilter(0, username);
    };
    PublicationController.prototype.fillPublication = function (data) {
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
    };
    PublicationController.prototype.getPublications = function (range_first, range_last) {
        var _this = this;
        var parameters = this.currentFilter;
        parameters.range_first = range_first;
        parameters.range_last = range_last;
        this.http.useGetHandler(parameters).then(function (data) { return _this.fillPublication(data); });
    };
    PublicationController.prototype.vote = function (pub_id, like) {
        var _this = this;
        this.http.handlerUrl = "vote/";
        this.http.usePostHandler($.param({ publication: pub_id, like: like })).then(function (data) { return _this.applyVote(data); });
    };
    PublicationController.prototype.applyVote = function (data) {
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
    };
    return PublicationController;
})();
var DragAndDrop = (function () {
    function DragAndDrop($scope) {
        this.scope = $scope;
        this.maxFileSize = 5242880;
        this.fileReader = new FileReader();
        this.initFileReader(this);
        this.prevPhoto = "";
        this.file = null;
        this.changed = false;
        this.inLoading = false;
    }
    DragAndDrop.prototype.init = function (dropzoneId, targetId) {
        this.dropzone = angular.element(dropzoneId);
        this.destination = angular.element(targetId);
        this.getPrevPhoto();
        this.initDropzone(this);
    };
    DragAndDrop.prototype.initDropzone = function (thisObj) {
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
    DragAndDrop.prototype.initFileReader = function (thisObj) {
        this.fileReader.onload = function (event) {
            thisObj.destination.attr('src', event.target.result);
        };
    };
    DragAndDrop.prototype.getPrevPhoto = function () {
        this.prevPhoto = this.destination.attr('src');
    };
    DragAndDrop.prototype.inverseParameterChanged = function () {
        this.changed = !this.changed;
    };
    return DragAndDrop;
})();
var PhotoUploader = (function (_super) {
    __extends(PhotoUploader, _super);
    function PhotoUploader($scope, $http) {
        _super.call(this, $scope);
        this.http = new HttpHandlerService($http);
    }
    PhotoUploader.prototype.fillFileFromInput = function () {
        this.fileReader.readAsDataURL(this.file);
    };
    PhotoUploader.prototype.applyChange = function () {
        var _this = this;
        this.http.handlerUrl = "updatePhoto/";
        var data = $.param({ photo_src: this.destination.attr('src') });
        this.changed = false;
        this.inLoading = true;
        this.http.usePostHandler(data)
            .then(function (data) { return _this.loadingFinished(); });
    };
    PhotoUploader.prototype.cancelChange = function () {
        this.destination.attr('src', this.prevPhoto);
    };
    PhotoUploader.prototype.loadingFinished = function () {
        this.inLoading = false;
    };
    return PhotoUploader;
})(DragAndDrop);
var TagController = (function () {
    function TagController($scope, $http) {
        this.tags = [];
        this.http = new HttpHandlerService($http);
        this.http.handlerUrl = "getTags/";
        this.fontMax = 3;
        this.fontMin = 1;
    }
    TagController.prototype.init = function () {
        var _this = this;
        this.http.useGetHandler({}).then(function (data) { return _this.fillTags(data); });
    };
    TagController.prototype.fillTags = function (data) {
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
            this.tags.push({ TagName: tag.name, Weight: Math.round(size) });
        }
    };
    return TagController;
})();
var PreviewController = (function (_super) {
    __extends(PreviewController, _super);
    function PreviewController($scope, $sce, $http) {
        _super.call(this, $scope);
        this.isBlank = [true, true];
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
    PreviewController.prototype.initPreview = function (htmlcontentId, dropzone, target, prev_data, author) {
        if (prev_data === void 0) { prev_data = []; }
        this.htmlcontent = angular.element(htmlcontentId);
        this.init(dropzone, target);
        this.category = "Biology";
        this.author = author;
        if (prev_data.length != 0) {
            this.fillPrevData(prev_data);
        }
    };
    PreviewController.prototype.checkTags = function () {
        if (this.tags.length < 3 || this.tags.length > 5)
            this.tagIncorrect = true;
        else
            this.tagIncorrect = false;
    };
    PreviewController.prototype.fillPrevData = function (prev_data) {
        this.header = prev_data[0].header;
        this.description = prev_data[0].description;
        angular.element('#editor')[0].textContent = prev_data[0].body;
        this.destination.attr('src', prev_data[0].image);
        //  this.destination.attr('style', 'background-image: url('+prev_data[0].image+');');
        var tags = [];
        var tagsSpited = prev_data[0].tag.split(", ");
        for (var iter in tagsSpited)
            tags.push({ text: tagsSpited[iter] });
        this.tags = tags;
        this.category = prev_data[0].category;
        this.save_as = prev_data[0].id;
        this.isBlank = [false, false];
        this.tagIncorrect = false;
    };
    PreviewController.prototype.ShowPublication = function () {
        this.htmlcontent = this.$sce.trustAsHtml(CKEDITOR.instances.editor.getData());
    };
    PreviewController.prototype.fillFileFromInput = function () {
        this.fileReader.readAsDataURL(this.file);
    };
    PreviewController.prototype.submit = function (template_id) {
        var _this = this;
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
            this.http.usePostHandler(data).then(function (data) { return _this.checkResponse(data); });
        }
    };
    PreviewController.prototype.checkResponse = function (data) {
        window.location = data.redirect;
    };
    PreviewController.prototype.inputChange = function (id, index) {
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
    };
    PreviewController.prototype.loadTags = function ($query) {
        var _this = this;
        this.http.handlerUrl = "getTags/";
        this.http.useGetHandler({ substr: $query }).then(function (data) { return _this.autotags = data.tags; });
        return this.autotags;
    };
    return PreviewController;
})(DragAndDrop);
var CommentsController = (function () {
    function CommentsController($scope, $http, $interval) {
        var _this = this;
        this.http = new HttpHandlerService($http);
        this.scope = $scope;
        this.comments = [];
        this.isBlank = true;
        this.text = "";
        this.interval = $interval;
        this.interval(function () {
            _this.getComments();
        }, 1500);
        this.isEdit = false;
        this.editcomment = "";
        this.editindex = -1;
        this.is_super = false;
        this.username = "";
        this.rate = 0;
        this.like = null;
    }
    CommentsController.prototype.getComments = function () {
        var _this = this;
        var data = {
            publication_id: this.publication_id
        };
        this.http.handlerUrl = "comments/";
        this.http.useGetHandler(data).then(function (data) { return _this.comments = data.comments; });
    };
    CommentsController.prototype.init = function (id, username, is_super, rate) {
        this.publication_id = id;
        this.username = username;
        this.is_super = is_super;
        this.rate = rate;
        this.getComments();
    };
    CommentsController.prototype.submit = function (publication_id) {
        var _this = this;
        if (!this.isBlank) {
            var data = $.param({
                publication_id: publication_id,
                text: this.text,
                edit: 'False'
            });
            this.http.handlerUrl = "createcomment/";
            this.http.usePostHandler(data).then(function (data) { return _this.getComments(); });
            this.input.val("");
        }
    };
    CommentsController.prototype.inputChange = function (id) {
        this.input = angular.element(id);
        if ($.trim(this.input.val()).length == 0) {
            this.input.val("");
            this.input.attr("placeholder", "Comment can't be empty");
            this.input.addClass("holdcol");
            //angular.element(id.concat('_tab')).addClass("has-error");
            this.isBlank = true;
        }
        else
            this.isBlank = false;
    };
    CommentsController.prototype.vote = function (comment_id, like, publication_id) {
        var _this = this;
        if (publication_id === void 0) { publication_id = 0; }
        this.http.handlerUrl = "vote/";
        if (comment_id)
            this.http.usePostHandler($.param({
                comment: comment_id,
                like: like
            })).then(function (data) { return _this.applyCommentVote(data); });
        else
            this.http.usePostHandler($.param({
                publication: publication_id,
                like: like
            })).then(function (data) { return _this.applyPublicationVote(data); });
    };
    CommentsController.prototype.applyPublicationVote = function (data) {
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
    };
    CommentsController.prototype.edit = function (value, isOk, text, index, id) {
        var _this = this;
        this.editindex = index;
        if (isOk && !($.trim(this.editcomment).length == 0)) {
            this.http.handlerUrl = "createcomment/";
            this.http.usePostHandler($.param({
                comment: id,
                text: this.editcomment,
                edit: 'True'
            })).then(function (data) { return _this.getComments(); });
        }
        else {
            this.editcomment = text;
        }
        this.isEdit = value;
    };
    CommentsController.prototype.deleteComment = function (id) {
        var _this = this;
        this.http.handlerUrl = "/deleteComment/" + id + '/';
        this.http.usePostHandler({}).then(function () { return _this.getComments(); });
    };
    CommentsController.prototype.applyCommentVote = function (data) {
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
    };
    return CommentsController;
})();
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
//# sourceMappingURL=app.js.map