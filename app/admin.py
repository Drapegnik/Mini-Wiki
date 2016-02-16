from django.contrib import admin
from tagging.registry import register

from app.models import *


# Register your models here.

class PublicationAdmin(admin.ModelAdmin):
    list_display = ('username', 'category', 'header', 'rate', 'created_at', 'updated_at', 'template', 'id')
    list_filter = ['rate']


class CommentAdmin(admin.ModelAdmin):
    list_display = ('username', 'publication', 'text', 'rate', 'created_at', 'updated_at', 'id')
    list_filter = ['rate']


class PublicationVoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'target_id', 'like')


class CommentVoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'target_id', 'like')


register(Publication)
admin.site.register(Publication, PublicationAdmin)
admin.site.register(Comment, CommentAdmin)
admin.site.register(PublicationVote, PublicationVoteAdmin)
admin.site.register(CommentVote,CommentVoteAdmin)
