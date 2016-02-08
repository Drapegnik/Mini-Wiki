import cloudinary
from django.db import models
from courseproject.models import Theme, Language
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from cloudinary.models import CloudinaryField
from django.utils import timezone


# Create your models here.

class AccountManager(BaseUserManager):
    def create_user(self, username, email, password=None, **kwargs):
        if not username:
            raise ValueError('Users must have a valid username.')

        if not email:
            raise ValueError('Users must have a valid email address.')

        account = self.model(username=username, email=self.normalize_email(email))

        account.set_password(password)
        account.save()
        return account

    def create_superuser(self, username, email, password, **kwargs):
        account = self.create_user(username, email, password, **kwargs)

        account.is_admin = True
        account.save()

        return account


class Account(AbstractBaseUser):
    username = models.CharField(max_length=254, unique=True)
    email = models.EmailField(max_length=254, blank=True, unique=True)
    location = models.CharField(max_length=140, blank=True)
    gender = models.CharField(max_length=140, blank=True)
    about = models.CharField(max_length=500, blank=True)
    photo = models.URLField(blank=True)
    theme = models.ForeignKey(Theme, default=1)
    language = models.ForeignKey(Language, default=1)

    is_admin = models.BooleanField(default=False)

    created_at = models.DateTimeField(default=timezone.now, editable=False, blank=True)
    updated_at = models.DateTimeField(default=timezone.now, editable=False, blank=True)

    objects = AccountManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

    def get_full_name(self):
        return self.username

    def get_short_name(self):
        return self.username

    @property
    def is_superuser(self):
        return self.is_admin

    @property
    def is_staff(self):
        return self.is_admin

    def has_perm(self, perm, obj=None):
        return self.is_admin

    def has_module_perms(self, app_label):
        return self.is_admin
