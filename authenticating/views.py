from django.core.urlresolvers import reverse
from django.shortcuts import render, redirect
from authenticating.forms import RegistrationForm
from .models import Account
from django.contrib.auth import views
import cloudinary
from courseproject import settings
from social.pipeline.partial import partial
from social.pipeline.user import USER_FIELDS


# Create your views here.

def registration(request):
    if request.user.is_authenticated():
        return redirect(reverse('home'))
    else:
        if request.method == 'POST':
            form = RegistrationForm(request.POST)
            if form.is_valid():
                Account.objects.create_user(form.cleaned_data['username'], form.cleaned_data['email'],
                                            form.cleaned_data['password'])
                obj = Account.objects.filter(username=form.cleaned_data['username'])[0]
                obj.photo = cloudinary.uploader.upload(settings.STATIC_ROOT+'/static/icons/userpic.png', public_id=obj.id)['url']
                obj.save()
            return redirect(reverse('login'))
        else:
            form = RegistrationForm()
    return render(request, 'registration/register.html', {'form': form})


def acquire_email(request, template_name="registration/emailrequest.html"):
    print(request.session)
    backend = request.session['partial_pipeline']['backend']
    return render(request, template_name, {"backend": backend})


def login(request):
    if request.user.is_authenticated():
        return redirect(reverse('home'))
    else:
        return views.login(request)
