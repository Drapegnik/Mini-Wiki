from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.shortcuts import render
from authenticating.forms import RegistrationForm
from django.shortcuts import redirect


# Create your views here.

def registration(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            User.objects.create_user(form.cleaned_data['username'], form.cleaned_data['password'])
        return redirect(reverse('login'))
    else:
        form = RegistrationForm()
    return render(request, 'registration/register.html', {'form': form})
