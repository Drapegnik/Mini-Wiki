from django.contrib import admin

from courseproject.models import *


class ThemeAdmin(admin.ModelAdmin):
    list_display = ('name', 'cssLink', 'id')


class LanguageAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'id')


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'id')


admin.site.register(Theme, ThemeAdmin)
admin.site.register(Language, LanguageAdmin)
admin.site.register(Category, CategoryAdmin)
