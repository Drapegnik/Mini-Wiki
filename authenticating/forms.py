from django import forms
from .models import Account
from django.utils.translation import ugettext as _


class RegForm(forms.ModelForm):
    class Meta:
        model = Account
        fields = ('username', 'email', 'password')

    password_again = forms.CharField(label='password_again', widget=forms.PasswordInput)

    def clean(self):
        cleaned_data = super(RegForm, self).clean()
        username = cleaned_data.get('username')
        email = cleaned_data.get('email')
        password = cleaned_data.get('password')
        password_again = cleaned_data.get('password_again')
        try:
            Account.objects.get(username=username)
            self.add_error('username', _('User with such username already exist'))
            Account.objects.get(email=email)
            self.add_error('email', _('User with such email already exist'))
        except Account.DoesNotExist:
            pass

        if password != password_again:
            self.add_error('password', _("Password's didn't match"))
