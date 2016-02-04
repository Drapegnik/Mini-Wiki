from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Theme(models.Model):
    name = models.CharField(max_length=150,unique=True)
    cssLink = models.URLField()

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=150,unique=True)

    def __str__(self):
        return self.name


class Publication(models.Model):
    user = models.ForeignKey(User)
    category = models.ForeignKey(Category)
    header = models.CharField(max_length=100)
    description = models.CharField(max_length=300)
    rate = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True,editable=False,blank=True)
    updated_at = models.DateTimeField(auto_now=True,editable=False,blank=True)

    def __str__(self):
        return self.header + u'. Author: %s'% self.user.username


class Comments(models.Model):
    user = models.ForeignKey(User)
    publication = models.ForeignKey(Publication)
    text = models.CharField(max_length=500)
    rate = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True,editable=False,blank=True)
    updated_at = models.DateTimeField(auto_now=True,editable=False,blank=True)

    def __str__(self):
        return u'. Comment to: %s'% self.publication.header + u'. Author: %s'% self.user.username





