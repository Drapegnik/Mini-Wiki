from authenticating.models import Account
from django.contrib import admin


# Register your models here.

class AccountAdmin(admin.ModelAdmin):
    list_display = (
        'username', 'email', 'location', 'gender', 'about', 'theme', 'language', 'created_at', 'updated_at', 'photo', 'id')
    fieldsets = [
        ('Basic', {'fields': ['username', 'email', 'password', 'is_admin']}),
        ('User information', {'fields': ['location', 'gender', 'about', 'theme', 'language', 'photo']}),
        ('Date information', {'fields': ['last_login']}),
    ]


admin.site.register(Account, AccountAdmin)
