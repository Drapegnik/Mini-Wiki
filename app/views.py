from cloudinary import uploader
from django.core.urlresolvers import reverse
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.utils import translation
from django.views.generic.base import View

from app.models import Publication
from courseproject.models import *
from authenticating.models import Account


# Create your views here.

def swap_language(request):
    if (request.user.is_authenticated()):
        translation.activate(request.user.language.code)
        request.session[translation.LANGUAGE_SESSION_KEY] = request.user.language.code


def home(request):
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
    return render(request, 'home.html', context_dict)


def user_profile(request, user_id):
    return render(request, 'user_profile.html')


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


def normalize_publication(publication):
    publication['category'] = Category.objects.get(id=publication['category']).name
    publication['username'] = Account.objects.get(id=publication['username']).username


def get_publications(request):
    username = request.GET.get("username")
    category_id = request.GET.get("categoryId")
    if category_id != '0':
        publications = Publication.objects.filter(category=category_id)
    else:
        user_id = Account.objects.get(username=username).id
        publications = Publication.objects.filter(username=user_id)
    publications_values = list(publications.values('username', 'category', 'header', 'description', 'rate',
                                                   'created_at', 'tag'))
    for i in range(len(publications_values)): normalize_publication(publications_values[i])
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
                                                                 'photo'))
        return JsonResponse(dict(profile=profile))


class AddPublication(View):
    @staticmethod
    def get(request, template_id, *args, **kwargs):
        if request.user.is_authenticated():
            context_dict = {'template': Template.objects.filter(id=template_id)[0].name + '.html'}
            return render(request, 'edit.html', context_dict)
        else:
            return redirect(reverse('login'))


# class PublicationView(View):
#     @staticmethod
#     def get(request, *args, **kwargs):
#         context_dict = {}
#         return render(request, 'Template1.html', context_dict)
