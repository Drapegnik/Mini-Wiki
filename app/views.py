from django.shortcuts import render
from authenticating.models import Account, Theme


# Create your views here.

def home(request):
    if request.user.is_authenticated():
        themeid = Account.objects.filter(username=request.user.username).values_list('theme')
        if (themeid):
            param = {'logined': 1, 'username': request.user.username,
                     'csslink': Theme.objects.filter(id=themeid).values_list('cssLink')[0][0]}
        else:
            param = {'logined': 1, 'username': request.user.username,
                     'csslink': Theme.objects.filter(id=1).values_list('cssLink')[0][0]}
    else:
        param = {'csslink': Theme.objects.filter(id=1).values_list('cssLink')[0][0]}
    return render(request, 'base.html', param)
