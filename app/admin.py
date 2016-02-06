from django.contrib import admin
from app.models import Theme, Category,Publication, Comment
from tagging.registry import register


class ThemeAdmin(admin.ModelAdmin):
    list_display = ('name', 'cssLink', 'id')


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'id')


class PublicationAdmin(admin.ModelAdmin):
    list_display = ('username', 'category', 'header', 'description', 'rate', 'created_at', 'updated_at', 'id')
    list_filter = ['rate']


class CommentAdmin(admin.ModelAdmin):
    list_display = ('username', 'publication', 'text', 'rate', 'created_at', 'updated_at', 'id')
    list_filter = ['rate']


admin.site.register(Theme, ThemeAdmin)
admin.site.register(Category, CategoryAdmin)
register(Publication)
admin.site.register(Publication, PublicationAdmin)
admin.site.register(Comment, CommentAdmin)
