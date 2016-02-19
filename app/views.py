import itertools
from ast import literal_eval

from cloudinary import uploader
from django.core.urlresolvers import reverse
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect
from django.utils import translation
from django.views.generic.base import View
from tagging.models import Tag, TaggedItem

from app.models import Publication, Comment, PublicationVote, CommentVote, Achievement, UsersAchievement
from authenticating.models import Account
from courseproject.models import *


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
    publication['category'] = Category.objects.get(id=publication['category']).name
    publication['author'] = Account.objects.get(id=publication['author']).username
    publication['comments_count'] = Comment.objects.filter(publication = publication['id']).count()
    try:
        vote = PublicationVote.objects.get(target_id=publication['id'], user=user.id)
        publication['like'] = vote.like
    except PublicationVote.DoesNotExist:
        pass


def get_publications(request):
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
                                                   'created_at', 'tag', 'image'))
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
        username = request.GET.get("username")
        profile = list(
                Account.objects.filter(username=username).values('username', 'email', 'location', 'gender', 'about',
                                                                 'photo', 'karma', 'id'))

        achievements_id = UsersAchievement.objects.filter(user=profile[0]['id']).values('achievement')
        achievements = []
        for elem in achievements_id:
            achievements.append(
                    Achievement.objects.filter(id=elem['achievement']).values('name', 'description', 'picture',
                                                                              'created_at')[0])
        print(achievements)
        return JsonResponse(dict(profile=profile, achievements=achievements))


class AddPublication(View):
    @staticmethod
    def get(request, template_id, *args, **kwargs):
        if request.user.is_authenticated():
            swap_language(request)
            context_dict = {
                'template_id': template_id,
                'template': Template.objects.get(id=template_id).name + '.html',
                'catlist': Category.objects.all().values('name'),
                'author_id':request.user.id
            }
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
            'author_id': Account.objects.get(username=publication.author).id
        }
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
            tags = itertools.islice(tags, 0, 10)
            response = []
            for tag in tags:
                response.append(dict(name=tag.name, count=tag.count))
            return JsonResponse(dict(tags=response))


class MakePublication(View):
    @staticmethod
    def post(request, *args, **kwargs):
        print(request.POST)
        author = request.user
        data = dict(request.POST)
        category = Category.objects.get(name=data['category'][0])
        template = Template.objects.get(id=data['template_id'][0])
        obj = Publication.objects.create(author=author, header=data['header'][0],
                                         description=data['description'][0],
                                         body=data['body'][0], category=category, template=template,
                                         tag=data['tagstring'][0][0:len(data['tagstring'][0]) - 2])
        p_id = 'p' + str(obj.id)
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
                dict(author=comment.author.username, author_id=Account.objects.get(username=comment.author.username).id,
                     text=comment.text, rate=comment.rate,
                     pic=comment.author.photo, created_at=comment.created_at, id=comment.id, like=like))
        return JsonResponse(dict(comments=response))


class CreateComment(View):
    @staticmethod
    def post(request, *args, **kwargs):
        print(request.POST)
        data = dict(request.POST)
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
        if author.karma >= 100:
            author.set_achievement("hundred")
        if id.author == request.user and like:
            author.set_achievement("selfLike")
        author.save()
        return JsonResponse(dict(like=like, target=id.id))
