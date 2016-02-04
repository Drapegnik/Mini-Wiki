from django.db import models
from app.models import Theme
from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.models import BaseUserManager
from django.contrib.auth.models import User
from cloudinary.models import CloudinaryField


# Create your models here.

class AccountManager(BaseUserManager):
    def create_user(self, email, password=None, **kwargs):
        if not email:
            raise ValueError('Users must have a valid email address.')

        if not kwargs.get('username'):
            raise ValueError('Users must have a valid username.')

        account = self.model(email=self.normalize_email(email), username=kwargs.get('username'))

        account.set_password(password)
        account.save()

        return account

    def create_superuser(self, email, password, **kwargs):
        account = self.create_user(email, password, **kwargs)

        account.is_admin = True
        account.save()

        return account


class Account(AbstractBaseUser):
    username = models.CharField(max_length=254, unique=True)
    email = models.EmailField(max_length=254, blank=True, unique=True)
    location = models.CharField(max_length=140, blank=True)
    gender = models.CharField(max_length=140, blank=True)
    about = models.CharField(max_length=500, blank=True)
    photo = CloudinaryField('image', blank=True)
    #theme = models.ForeignKey(Theme)

    is_admin = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True, editable=False, blank=True)
    updated_at = models.DateTimeField(auto_now=True, editable=False, blank=True)

    objects = AccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return u'Profile of user: %s' % self.user.username
