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
    }
    PublicationController.prototype.setFilter = function (categoryId, username, tags, sortBy) {
        if (categoryId === void 0) { categoryId = 0; }
        if (username === void 0) { username = ""; }
        if (tags === void 0) { tags = ""; }
        if (sortBy === void 0) { sortBy = "-rate"; }
        this.http.handlerUrl = "publications/";
        this.viewProfile = username != "";
        if (username) {
            this.userProfile.getProfile(username);
        }
        this.currentFilter = {
            "categoryId": categoryId == 0 ? "" : categoryId,
            "author": username,
            "sort_by": sortBy
        };
        this.publications = [];
        this.getPublications(0, 4);
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
    PublicationController.prototype.init = function () {
        this.setFilter();
    };
    PublicationController.prototype.fillPublication = function (data) {
        for (var iterartor in data.publications) {
            data.publications[iterartor].tag = data.publications[iterartor].tag.split(", ");
            this.publications.push(data.publications[iterartor]);
        }
        if (data.publications.length != 0)
            this.busy = false;
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
        if (publication.like == true)
            publication.rate -= 2;
        if (publication.like == false)
            publication.rate += 2;
        if (isNaN(publication.like))
            publication.rate += data.like ? 1 : -1;
        publication.like = data.like;
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
        this.isBlank = [true, true, false];
        this.$scope = $scope;
        this.$sce = $sce;
        this.header = "";
        this.description = "";
        this.tags = [];
        this.autatags = [];
        this.category = "";
        this.http = new HttpHandlerService($http);
        this.errors = [];
        this.data = new Date();
        this.tagstring = "";
    }
    PreviewController.prototype.initPreview = function (htmlcontentId, dropzone, target) {
        this.htmlcontent = angular.element(htmlcontentId);
        this.init(dropzone, target);
    };
    PreviewController.prototype.ShowPublication = function () {
        console.log(this.tags);
        this.data = new Date();
        this.htmlcontent = this.$sce.trustAsHtml(CKEDITOR.instances.editor.getData());
    };
    PreviewController.prototype.fillFileFromInput = function () {
        this.fileReader.readAsDataURL(this.file);
    };
    PreviewController.prototype.submit = function (template_id) {
        var _this = this;
        if (!(this.isBlank[0] || this.isBlank[1] || this.isBlank[2])) {
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
                image: this.destination.attr('src')
            });
            console.log(data);
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
        this.http.handlerUrl = "getTags/";
        this.http.useGetHandler({ substr: $query }).then(function (data) { return _this.autatags = data.tags; });
        return this.autatags;
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
    }
    CommentsController.prototype.getComments = function () {
        var _this = this;
        var data = {
            publication_id: this.publication_id
        };
        this.http.handlerUrl = "comments/";
        this.http.useGetHandler(data).then(function (data) { return _this.comments = data.comments; });
    };
    CommentsController.prototype.init = function (id) {
        this.publication_id = id;
        this.getComments();
    };
    CommentsController.prototype.submit = function (publication_id) {
        var _this = this;
        if (!this.isBlank) {
            var data = $.param({
                publication_id: publication_id,
                text: this.text
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
    CommentsController.prototype.vote = function (comment_id, like) {
        var _this = this;
        this.http.handlerUrl = "vote/";
        this.http.usePostHandler($.param({ comment: comment_id, like: like })).then(function (data) { return _this.applyVote(data); });
    };
    CommentsController.prototype.applyVote = function (data) {
        var comments = this.comments.filter(function (obj) {
            return obj.id == data.target;
        })[0];
        if (comments.like == true)
            comments.rate -= 2;
        if (comments.like == false)
            comments.rate += 2;
        if (isNaN(comments.like))
            comments.rate += data.like ? 1 : -1;
        comments.like = data.like;
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