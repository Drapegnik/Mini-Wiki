from django.shortcuts import render
from authenticating.models import Account, Theme


# Create your views here.

def home(request):
    return render(request, 'base.html')
