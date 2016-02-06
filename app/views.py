from django.shortcuts import render
from app.models import Category, Publication
from django.http import JsonResponse


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
    return render(request, 'profile_settings.html')


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
