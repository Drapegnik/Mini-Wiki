from django.contrib import admin
from tagging.registry import register
from app.models import *


# Register your models here.

class PublicationAdmin(admin.ModelAdmin):
    list_display = ('username', 'category', 'header', 'rate', 'created_at', 'updated_at', 'id')
    list_filter = ['rate']


class CommentAdmin(admin.ModelAdmin):
    list_display = ('username', 'publication', 'text', 'rate', 'created_at', 'updated_at', 'id')
    list_filter = ['rate']


register(Publication)
admin.site.register(Publication, PublicationAdmin)
admin.site.register(Comment, CommentAdmin)
