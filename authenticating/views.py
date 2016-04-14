import cloudinary
from django.contrib.auth import views
from django.core.urlresolvers import reverse
from django.shortcuts import render, redirect

from authenticating.forms import RegForm
from courseproject import settings
from .models import Account


# Create your views here.

def registration(request):
    if request.user.is_authenticated():
        return redirect(reverse('home'))
    else:
        if request.method == 'POST':
            form = RegForm(request.POST)
            if form.is_valid():
                Account.objects.create_user(form.cleaned_data['username'], form.cleaned_data['email'],
                                            form.cleaned_data['password'])
                obj = Account.objects.get(username=form.cleaned_data['username'])
                obj.photo = \
                    cloudinary.uploader.upload(settings.STATIC_ROOT + '/icons/userpic.png', public_id=obj.id)[
                        'url']
                obj.save()
                return redirect(reverse('login'))
            else:
                return render(request, 'registration/register.html', {'form': form})
        else:
            form = RegForm()
    return render(request, 'registration/register.html', {'form': form})


def acquire_email(request, template_name="registration/emailrequest.html"):
    backend = request.session['partial_pipeline']['backend']
    return render(request, template_name, {"backend": backend})


def login(request):
    if request.user.is_authenticated():
        return redirect(reverse('home'))
    else:
        return views.login(request)
