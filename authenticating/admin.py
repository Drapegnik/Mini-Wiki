from authenticating.models import Account
from django.contrib import admin


# Register your models here.

class AccountAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'location', 'gender', 'about', 'theme', 'created_at', 'updated_at', 'id')
    fieldsets = [
        ('Basic',            {'fields': ['username', 'email', 'password', 'is_admin']}),
        ('User information', {'fields': ['location', 'gender', 'about', 'theme', 'photo']}),
        ('Date information', {'fields': ['last_login']}),
    ]
    list_filter = ['id']


admin.site.register(Account, AccountAdmin)
