from django.contrib import admin
from app.models import Theme, Category,Publication, Comments

# Register your models here.
admin.site.register(Theme)
admin.site.register(Category)
admin.site.register(Publication)
admin.site.register(Comments)
