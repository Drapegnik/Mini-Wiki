from django.db import models
from app.models import Theme

# Create your models here.

from django.contrib.auth.models import User
from cloudinary.models import CloudinaryField


class UserProfile(models.Model):
    user = models.OneToOneField(User)
    email = models.EmailField(max_length=254,blank=True)
    location = models.CharField(max_length=140,blank=True)
    gender = models.CharField(max_length=140,blank=True)
    about = models.CharField(max_length=500,blank=True)
    photo = CloudinaryField('image',blank=True)
    theme = models.ForeignKey(Theme)

    def __str__(self):
        return u'Profile of user: %s' % self.user.username