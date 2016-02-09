from app.models import Category, Publication
from django.http import JsonResponse, HttpResponse
from django.core.urlresolvers import reverse
from django.shortcuts import render, redirect
from authenticating.models import Account, Theme, Language
from app.models import Category
from django.utils import translation
from django.views.generic.base import View
import cloudinary


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
    user_id = request.GET.get("userId")
    category_id = request.GET.get("categoryId")
    if category_id != 0:
        publications = Publication.objects.filter(category=category_id)
    else:
        publications = Publication.objects.filter(username=user_id)
    publications_values = list(publications.values('username', 'category', 'header', 'description', 'rate',
                                                   'created_at', 'tag'))
    for i in range(len(publications_values)): normalize_publication(publications_values[i])
    response = JsonResponse(dict(publications=publications_values))
    return response


class UpdatePhoto(View):
    def post(self, request, *args, **kwargs):
        photo_src = request.POST.get('src')
        print (photo_src)
