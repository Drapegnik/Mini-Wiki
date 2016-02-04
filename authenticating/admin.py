from authenticating.models import Account
from django.contrib import admin


# Register your models here.

class AccountAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'location', 'gender', 'about', 'id') #'theme'


admin.site.register(Account, AccountAdmin)
