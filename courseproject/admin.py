from django.contrib import admin

from courseproject.models import *


class ThemeAdmin(admin.ModelAdmin):
    list_display = ('name', 'css_link', 'id')


class LanguageAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'id')


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'id')

class TemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'preview_link', 'id')


admin.site.register(Theme, ThemeAdmin)
admin.site.register(Language, LanguageAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Template, TemplateAdmin)
