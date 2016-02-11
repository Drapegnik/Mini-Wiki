from django import forms
from .models import Account


# class RegistrationForm(forms.Form):
#     username = forms.CharField(max_length=254, )
#     email = forms.EmailField(max_length=254)
#     password = forms.CharField(label='Password', widget=forms.PasswordInput)


class RegForm(forms.ModelForm):
    class Meta:
        model = Account
        fields = ('username', 'email', 'password')


class AccountForm(forms.ModelForm):
    class Meta:
        model = Account
        fields = '__all__'


class PhotoForm(forms.ModelForm):
    class Meta:
        model = Account
        fields = ('photo',)
