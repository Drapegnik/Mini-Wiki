from django.db import models
from courseproject import settings
from tagging.fields import TagField
from courseproject.models import Category, Template


class Publication(models.Model):
    username = models.ForeignKey(settings.AUTH_USER_MODEL)
    category = models.ForeignKey(Category)
    header = models.CharField(max_length=100)
    description = models.CharField(max_length=300)
    rate = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, editable=False, blank=True)
    updated_at = models.DateTimeField(auto_now=True, editable=False, blank=True)
    body = models.CharField(max_length=5000, null=True)
    tag = TagField()
    template = models.ForeignKey(Template)
    image = models.URLField(blank=True)

    def __str__(self):
        return self.header + u'. Author: %s' % self.username


class Comment(models.Model):
    username = models.ForeignKey(settings.AUTH_USER_MODEL)
    publication = models.ForeignKey(Publication)
    text = models.CharField(max_length=500)
    rate = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, editable=False, blank=True)
    updated_at = models.DateTimeField(auto_now=True, editable=False, blank=True)

    def __str__(self):
        return u'. Comment to: %s' % self.publication.header + u'. Author: %s' % self.username
