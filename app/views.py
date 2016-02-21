import itertools
import random
from ast import literal_eval

from cloudinary import uploader
from django.core.urlresolvers import reverse
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect
from django.utils import translation
from django.views.generic.base import View
from haystack.views import SearchView
from tagging.models import Tag, TaggedItem

from app.models import *
from authenticating.models import Account
from courseproject.models import *
from django.utils.translation import ugettext as _


# Create your views here.

def swap_language(request):
    if (request.user.is_authenticated()):
        translation.activate(request.user.language.code)
        request.session[translation.LANGUAGE_SESSION_KEY] = request.user.language.code


def home(request, username=""):
    swap_language(request)
    context_dict = {'templates': Template.objects.all()}
    try:
        category = Category.objects.order_by('name')
        context_dict['categories'] = category
    except Category.DoesNotExist:
        pass
    if request.user.is_authenticated():
        translation.activate(request.user.language.code)
        request.session[translation.LANGUAGE_SESSION_KEY] = request.user.language.code
    context_dict['username'] = username
    return render(request, 'home.html', context_dict)


def user_profile(request, user_id):
    if isinstance(user_id, int):
        return home(request, Account.objects.get(id=user_id).username)
    return home(request, Account.objects.get(id=user_id).username)


def profile_settings(request, user_id):
    if request.method == 'GET':
        context_dict = {'selectgender': ['select', 'Male', 'Female'],
                        'themes': Theme.objects.all(),
                        'selectlang': Language.objects.all()}
        swap_language(request)
        return render(request, 'profile_settings.html', context_dict)
    else:
        obj = Account.objects.filter(id=request.user.id)[0]
        obj.gender = request.POST.get('gender', ' ')
        obj.location = request.POST.get('location')
        obj.about = request.POST.get('about')
        obj.theme = Theme.objects.filter(name=request.POST.get('theme'))[0]
        obj.language = Language.objects.filter(name=request.POST.get('language'))[0]
        obj.save()
        return redirect(reverse('home'))


def normalize_publication(publication, user):
    publication['category'] = _(Category.objects.get(id=publication['category']).name)
    publication['author'] = Account.objects.get(id=publication['author']).username
    publication['comments_count'] = Comment.objects.filter(publication=publication['id']).count()
    try:
        vote = PublicationVote.objects.get(target_id=publication['id'], user=user.id)
        publication['like'] = vote.like
    except PublicationVote.DoesNotExist:
        pass


def get_publications(request):
    swap_language(request)
    author = request.GET.get("author")
    category_id = request.GET.get("categoryId")
    sort_by = request.GET.get("sort_by")
    range_first = request.GET.get("first")
    range_last = request.GET.get("last")
    tags = request.GET.get("tag")
    range_first = int(request.GET.get("range_first"))
    range_last = int(request.GET.get("range_last"))

    pub_filter = lambda xz: Publication.objects.filter(**xz).order_by(sort_by)[range_first:range_last]
    if category_id:
        publications = pub_filter({'category': category_id})
    elif author:
        publications = pub_filter({'author': Account.objects.get(username=author).id})
    elif tags:
        tag_obj = Tag.objects.get(name=tags)
        publications = TaggedItem.objects.get_union_by_model(Publication, tag_obj).order_by(sort_by)[
                       range_first:range_last]
    else:
        publications = pub_filter({'rate__gte': -100})

    publications_values = list(publications.values('id', 'author', 'category', 'header', 'description', 'rate',
                                                   'created_at', 'tag', 'image', 'template'))
    for i in range(len(publications_values)): normalize_publication(publications_values[i], request.user)
    response = JsonResponse(dict(publications=publications_values))
    return response


class UpdatePhoto(View):
    @staticmethod
    def post(request, *args, **kwargs):
        photo_src = request.POST.get("photo_src")
        user_id = request.user.id
        uploader.destroy(request.user, invalidate=True)
        user = Account.objects.get(id=user_id)
        user.photo = uploader.upload(photo_src, public_id=user_id, invalidate=True)['url']
        user.save()
        return JsonResponse({"done": "true"})


class GetProfile(View):
    @staticmethod
    def get(request, *args, **kwargs):
        swap_language(request)
        username = request.GET.get("username")
        profile = list(
                Account.objects.filter(username=username).values('username', 'email', 'location', 'gender', 'about',
                                                                 'photo', 'karma', 'id'))

        achievements_id = UsersAchievement.objects.filter(user=profile[0]['id']).values('achievement')
        achievements = []
        for elem in achievements_id:
            achievements.append(
                    Achievement.objects.filter(id=elem['achievement']).values('name', 'description', 'picture','id')[0])
        print(achievements)
        for elem in achievements:
            elem['description'] = _(elem['description'])
            elem['created_at'] = UsersAchievement.objects.get(user=profile[0]['id'],achievement=elem['id']).created_at
        return JsonResponse(dict(profile=profile, achievements=achievements))


class AddPublication(View):
    @staticmethod
    def get(request, template_id, prev_id, *args, **kwargs):
        if int(prev_id):
            if Publication.objects.get(id=prev_id).author != request.user and not request.user.is_superuser:
                return redirect(reverse('home'))
        if request.user.is_authenticated():
            swap_language(request)
            context_dict = {
                'template_id': template_id,
                'template': Template.objects.get(id=template_id).name + '.html',
                'catlist': Category.objects.all().values('name'),
                'author_id': 0,
                'prev_data': list(
                        Publication.objects.filter(id=prev_id).values('category', 'header', 'tag', 'description',
                                                                      'body',
                                                                      'image', 'id'))
            }
            if context_dict['prev_data']:
                try:
                    context_dict['prev_data'][0]['category'] = Category.objects.get(
                            id=context_dict['prev_data'][0]['category']).name
                except Category.DoesNotExist:
                    pass
            return render(request, 'edit.html', context_dict)
        else:
            return redirect(reverse('login'))


class ShowPublication(View):
    @staticmethod
    def get(request, publication_id, *args, **kwargs):
        swap_language(request)
        publication = Publication.objects.get(id=publication_id)
        context_dict = {
            'template': publication.template.name + '.html',
            'image': publication.image,
            'publication': publication,
            'author_id': Account.objects.get(username=publication.author).id,
            'is_super': request.user.is_superuser,
        }
        if request.user.is_authenticated:
            try:
                like = PublicationVote.objects.get(target_id=publication_id, user=request.user).like
            except PublicationVote.DoesNotExist:
                like = None
        context_dict['like'] = like
        return render(request, 'article.html', context_dict)


class GetTags(View):
    @staticmethod
    def get(request, *args, **kwargs):
        data = dict(request.GET)
        if data.get('substr'):
            tags = Tag.objects.filter(name__startswith=data.get('substr')[0])
            response = []
            for tag in tags:
                response.append(dict(text=tag.name))
            return JsonResponse(dict(tags=response))
        else:
            tags = Tag.objects.usage_for_model(Publication, counts=True)
            tags.sort(key=lambda tag: tag.count, reverse=True)
            tags = list(itertools.islice(tags, 0, 10))
            random.shuffle(tags)
            response = []
            for tag in tags:
                response.append(dict(name=tag.name, count=tag.count))
            return JsonResponse(dict(tags=response))


class MakePublication(View):
    @staticmethod
    def create_publication(data, category, template, author):
        return Publication.objects.create(author=author, header=data['header'][0],
                                          description=data['description'][0],
                                          body=data['body'][0], category=category, template=template,
                                          tag=data['tagstring'][0][0:len(data['tagstring'][0]) - 2])

    @staticmethod
    def update_publication(save_as, data, category):
        obj = Publication.objects.get(id=save_as)
        obj.category = category
        obj.tag = data['tagstring'][0][0:len(data['tagstring'][0]) - 2]
        obj.description = data['description'][0]
        obj.header = data['header'][0]
        obj.body = data['body'][0]

        return obj

    @staticmethod
    def post(request, *args, **kwargs):
        print(request.POST)
        author = request.user
        data = dict(request.POST)
        category = Category.objects.get(name=data['category'][0])
        template = Template.objects.get(id=data['template_id'][0])
        if not int(data['save_as'][0]):
            obj = MakePublication.create_publication(data, category, template, author)
        else:
            obj = MakePublication.update_publication(data['save_as'][0], data, category)
        p_id = 'p' + str(obj.id)
        if (data['image'][0]):
            uploader.destroy(p_id, invalidate=True)
            obj.image = uploader.upload(data['image'][0], public_id=p_id, invalidate=True)['url']
        obj.save()
        return JsonResponse(dict(redirect=reverse('show', args=[obj.id])))


class GetComments(View):
    @staticmethod
    def get(request, *args, **kwargs):
        publication_id = request.GET.get('publication_id')
        comments = Comment.objects.all().filter(publication=publication_id)
        response = []
        for comment in comments:
            like = None
            try:
                vote = CommentVote.objects.get(target_id=comment.id, user=request.user.id)
                like = vote.like
            except CommentVote.DoesNotExist:
                pass
            response.append(
                    dict(author=comment.author.username,
                         author_id=Account.objects.get(username=comment.author.username).id,
                         text=comment.text, rate=comment.rate,
                         pic=comment.author.photo, created_at=comment.created_at, id=comment.id, like=like))
        return JsonResponse(dict(comments=response))


class CreateComment(View):
    @staticmethod
    def post(request, *args, **kwargs):
        print(request.POST)
        data = dict(request.POST)
        if literal_eval(data['edit'][0]):
            obj = Comment.objects.get(id=data['comment'][0])
            obj.text = data['text'][0]
            obj.save()
            return HttpResponse(200)
        else:
            publication = Publication.objects.get(id=data['publication_id'][0])
            if not Comment.objects.filter(publication=publication).count():
                request.user.set_achievement("gagarin")
            if Comment.objects.filter(author=request.user).count() == 10:
                request.user.set_achievement("critic")
            obj = Comment.objects.create(author=request.user, publication=publication, text=data['text'][0])
            obj.save()
            return redirect(reverse('show', args=[publication.id]))


class VotesController(View):
    @staticmethod
    def post(request, *args, **kwargs):
        like = literal_eval(request.POST.get('like'))
        publication_id = request.POST.get('publication')
        comment_id = request.POST.get('comment')
        if publication_id:
            model = PublicationVote
            id = Publication.objects.get(id=publication_id)
        elif comment_id:
            model = CommentVote
            id = Comment.objects.get(id=comment_id)
        else:
            return HttpResponse(500)
        try:
            obj = model.objects.get(user=request.user, target_id=id)
            if obj.like != like:
                obj.like = like
                obj.save()
            else:
                obj.delete()
        except model.DoesNotExist:
            model.objects.create(user=request.user, target=id, like=like)
        id.rate = id.calculate_rate()
        id.save()
        author = Account.objects.get(username=id.author)
        author.karma = author.calculate_rate()
        if author.karma >= 10:
            author.set_achievement("hundred")
        if id.author == request.user and like:
            author.set_achievement("like_youself")
        author.save()
        return JsonResponse(dict(like=like, target=id.id))


class MySearchView(SearchView):
    """My custom search view."""

    def __call__(self, request, *args, **kwargs):
        swap_language(request)
        return super(MySearchView, self).__call__(request)

    def get_results(self):
        results = super(MySearchView, self).get_results()
        response_results = []
        publications = []
        comments = []
        for res in results:
            if (res.model == Publication):
                response_results.append(res)
                publications.append(res.object.id)
            else:
                comments.append(res)

        for com in comments:
            if com.object.publication.id not in publications:
                publications.append(com.object.publication.id)
                response_results.append(com)

        return response_results


class DeletePublication(View):
    @staticmethod
    def get(request, publication_id, *args, **kwargs):
        if Publication.objects.get(id=publication_id).author == request.user or request.user.is_superuser:
            p_id = 'p' + str(publication_id)
            uploader.destroy(p_id, invalidate=True)
            Publication.objects.get(id=publication_id).delete()
        return redirect(reverse('home'))


class DeleteComment(View):
    @staticmethod
    def post(request, comment_id, *args, **kwargs):
        if Comment.objects.get(id=comment_id).author == request.user or request.user.is_superuser:
            Comment.objects.get(id=comment_id).delete()
        return redirect(reverse('home'))
