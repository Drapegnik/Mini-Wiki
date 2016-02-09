from cloudinary import uploader
from django.core.urlresolvers import reverse
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.utils import translation
from django.views.generic.base import View

from app.models import Category
from app.models import Publication
from authenticating.models import Account, Theme, Language


# Create your views here.

def home(request):
    context_dict = {}
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
    if request.user.is_authenticated():
        translation.activate(request.user.language.code)
        request.session[translation.LANGUAGE_SESSION_KEY] = request.user.language.code
    if request.method == 'GET':
        return render(request, 'profile_settings.html',
                      {'selectgender': ['select', 'Male', 'Female'],
                       'themes': Theme.objects.all(),
                       'selectlang': Language.objects.all()})
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
    def post(self, request, *args, **kwargs):
        photo_src = request.POST.get("photo_src")
        user_id = request.user.id
        uploader.destroy(request.user, invalidate=True)
        user = Account.objects.get(id=user_id)
        user.photo = uploader.upload(photo_src, public_id=user_id, invalidate=True)['url']
        user.save()
        return JsonResponse({"done": "true"})


class GetProfile(View):
    def get(self, request, *args, **kwargs):
        username = request.GET.get("username")
        profile = list(
            Account.objects.filter(username=username).values('username', 'email', 'location', 'gender', 'about',
                                                             'photo'))
        return JsonResponse(dict(profile=profile))
