from django.core.urlresolvers import reverse
from django.shortcuts import render, redirect
from authenticating.forms import RegistrationForm
from .models import Account


# Create your views here.

def registration(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            Account.objects.create_user(form.cleaned_data['username'], form.cleaned_data['email'],
                                        form.cleaned_data['password'])
        return redirect(reverse('login'))
    else:
        form = RegistrationForm()
    return render(request, 'registration/register.html', {'form': form})
