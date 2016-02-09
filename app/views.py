from app.models import Category, Publication
from django.http import JsonResponse, HttpResponse
from django.core.urlresolvers import reverse
from django.shortcuts import render, redirect
from authenticating.models import Account, Theme, Language
from app.models import Category
from django.utils import translation
import cloudinary


# Create your views here.

def swap_language(request):
    if (request.user.is_authenticated()):
        translation.activate(request.user.language.code)
        request.session[translation.LANGUAGE_SESSION_KEY] = request.user.language.code

def home(request):
    swap_language(request)
    context_dict = {}
    try:
        category = Category.objects.order_by('name')
        context_dict['categories'] = category
    except Category.DoesNotExist:
        pass
    if (request.user.is_authenticated()):
        translation.activate(request.user.language.code)
        request.session[translation.LANGUAGE_SESSION_KEY] = request.user.language.code
    return render(request, 'home.html', context_dict)


def user_profile(request, user_id):
    return render(request, 'user_profile.html')


def profile_settings(request, user_id):
    if request.method == 'GET':
        swap_language(request)
        return render(request, 'profile_settings.html',
                      {'selectgender': ['select', 'Male', 'Female'],
                       'themes': Theme.objects.all(),
                       'selectlang': Language.objects.all()})
    else:
        obj = Account.objects.filter(id=request.user.id)[0]
        obj.gender = request.POST.get('gender', ' ')
        obj.location = request.POST.get('location')
        obj.about = request.POST.get('about')
        # if (request.POST.get('photo') != ''):
        #     cloudinary.uploader.destroy(user_id, invalidate=True)
        #     obj.photo = cloudinary.uploader.upload(request.FILES.get('photo'), public_id=user_id, invalidate=True)['url']
        obj.theme = Theme.objects.filter(name=request.POST.get('theme'))[0]
        obj.language = Language.objects.filter(name=request.POST.get('language'))[0]
        obj.save()
        return redirect(reverse('home'))


def normalizePublication(publication):
    publication['category'] = Category.objects.get(id=publication['category']).name
    publication['username'] = Account.objects.get(id=publication['username']).username


def getPublications(request):
    userId = request.GET.get("userId")
    categoryId = request.GET.get("categoryId")
    if categoryId != 0:
        publications = Publication.objects.filter(category=categoryId)
    else:
        publications = Publication.objects.filter(username=userId)
    publicationsValues = list(publications.values('username', 'category', 'header', 'description', 'rate', 'created_at',
                                                  'tag'))
    for i in range(len(publicationsValues)): normalizePublication(publicationsValues[i])
    response = JsonResponse(dict(publications=publicationsValues))
    return response
