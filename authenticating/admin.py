from django.contrib import admin

from authenticating.models import Account, Ban


# Register your models here.

class AccountAdmin(admin.ModelAdmin):
    list_display = (
        'username', 'email', 'location', 'gender', 'about', 'theme', 'language', 'created_at', 'updated_at', 'photo',
        'id')
    fieldsets = [
        ('Basic', {'fields': ['username', 'email', 'password', 'is_admin']}),
        ('User information', {'fields': ['location', 'gender', 'about', 'theme', 'language', 'photo', 'karma']}),
        ('Date information', {'fields': ['last_login']}),
    ]


class Ban_Admin(admin.ModelAdmin):
    fieldsets = [
        (None, {'fields': ['user']}),
        (None, {'fields': ['reason']})]

    list_display = ('user', 'reason')

    search_fields = ['user', 'reason']


admin.site.register(Ban, Ban_Admin)
admin.site.register(Account, AccountAdmin)
