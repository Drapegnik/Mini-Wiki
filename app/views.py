from django.views.decorators.csrf import csrf_exempt

from app.models import Category, Publication
from django.http import JsonResponse, HttpResponse
from django.core.urlresolvers import reverse
from django.shortcuts import render, redirect
from authenticating.models import Account, Theme, Language
from app.models import Category
from authenticating.forms import AccountForm, PhotoForm
import cloudinary


# Create your views here.

def home(request):
    context_dict = {}
    try:
        category = Category.objects.order_by('name')
        context_dict['categories'] = category
    except Category.DoesNotExist:
        pass
    return render(request, 'home.html', context_dict)


def user_profile(request, user_id):
    return render(request, 'user_profile.html')


def profile_settings(request, user_id):
    if request.method == 'GET':
        return render(request, 'profile_settings.html',
                      {'selectgender': ['select', 'Male', 'Female'],
                       'themes': Theme.objects.all(),
                       'selectlang': Language.objects.all()})
    else:
        obj = Account.objects.filter(id=request.user.id)[0]
        obj.location = request.POST.get('location')
        obj.gender = request.POST.get('gender')
        obj.about = request.POST.get('about')
        if (request.POST.get('photo') != ''):
            obj.photo = request.FILES.get('photo')
        obj.theme = Theme.objects.filter(name=request.POST.get('theme'))[0]
        obj.language = Language.objects.filter(name=request.POST.get('language'))[0]
        obj.save()
        print(request.POST)
        print(request.FILES)
        return redirect(reverse('home'))


def getPublications(request):
    userId = request.GET.get("userId")
    categoryId = request.GET.get("categoryId")
    if (categoryId != 0):
        publications = Publication.objects.filter(category=categoryId)
    else:
        publications = Publication.objects.filter(username=userId)
    response = JsonResponse(dict(publications=list(
            publications.values('username', 'category', 'header', 'description', 'rate', 'created_at',
                                'tag'))))
    return response