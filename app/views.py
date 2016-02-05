from django.shortcuts import render
from authenticating.models import Account, Theme
from app.models import Category


# Create your views here.

def home(request):
    context_dict = {}
    try:
        category = Category.objects.all()
        context_dict['categories'] = category.Category
    except Category.DoesNotExist:
        pass
    return render(request, 'base.html',context_dict)


def user_profile(request, user_id):
    return render(request, 'user_profile.html')


def profile_settings(request, user_id):
    return render(request, 'profile_settings.html')
