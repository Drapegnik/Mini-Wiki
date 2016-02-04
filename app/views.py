from django.shortcuts import render


# Create your views here.

def home(request):
    return render(request, 'base.html', {'dark': 0})
