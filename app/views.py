from django.shortcuts import render
from authenticating.models import Account, Theme


# Create your views here.

def home(request):
    return render(request, 'base.html')


def user_profile(request, user_id):
    return render(request, 'user_profile.html')


def profile_settings(request, user_id):
    return render(request, 'profile_settings.html')
