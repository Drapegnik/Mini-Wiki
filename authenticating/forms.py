from django import forms
from .models import UserProfile

class RegistrationForm(forms.Form):
    username = forms.CharField(max_length=254)
    email = forms.EmailField(max_length=254)
    password = forms.CharField(label='Password', widget=forms.PasswordInput)



class UserProfielForm(forms.ModelForm):
  class Meta:
      model = UserProfile
      fields = '__all__'
