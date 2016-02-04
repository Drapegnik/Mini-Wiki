from django.contrib import admin
from app.models import Theme, Category, Publication, Comments


# Register your models here.

class ThemeAdmin(admin.ModelAdmin):
    list_display = ('name', 'cssLink', 'id')


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'id')


class PublicationAdmin(admin.ModelAdmin):
    list_display = ('category', 'header', 'description', 'rate', 'created_at', 'updated_at', 'id')

class CommentsAdmin(admin.ModelAdmin):
    list_display = ('publication', 'text', 'rate', 'created_at', 'updated_at',  'id')


admin.site.register(Theme, ThemeAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Publication, PublicationAdmin)
admin.site.register(Comments, CommentsAdmin)
