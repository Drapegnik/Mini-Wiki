from django.db import models
from tagging.fields import TagField

from courseproject import settings
from courseproject.models import Category, Template


class Publication(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL)
    category = models.ForeignKey(Category)
    header = models.CharField(max_length=100)
    description = models.CharField(max_length=300)
    rate = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, editable=False, blank=True)
    updated_at = models.DateTimeField(auto_now=True, editable=False, blank=True)
    # body = models.CharField(max_length=5000, null=True)
    body = models.TextField()
    tag = TagField()
    template = models.ForeignKey(Template)
    image = models.URLField(blank=True)

    def __str__(self):
        return self.header + u'. Author: %s' % self.author

    def calculate_rate(self):
        return PublicationVote.objects.filter(target_id=self, like=True).count() - PublicationVote.objects.filter(
                target_id=self, like=False).count()


class Comment(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL)
    publication = models.ForeignKey(Publication)
    text = models.CharField(max_length=500)
    rate = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, editable=False, blank=True)
    updated_at = models.DateTimeField(auto_now=True, editable=False, blank=True)

    def __str__(self):
        return u'. Comment to: %s' % self.publication.header + u'. Author: %s' % self.author

    def calculate_rate(self):
        return CommentVote.objects.filter(target_id=self, like=True).count() - CommentVote.objects.filter(
                target_id=self, like=False).count()


class PublicationVote(models.Model):
    like = models.BooleanField()
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    target = models.ForeignKey(Publication)


class CommentVote(models.Model):
    like = models.BooleanField()
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    target = models.ForeignKey(Comment)


class Achievement(models.Model):
    name = models.CharField(max_length=15, unique=True)
    description = models.CharField(max_length=200, default="")
    picture = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True, editable=False, blank=True)


class UsersAchievement(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL)
    achievement = models.ForeignKey(Achievement)
