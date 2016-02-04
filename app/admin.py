from django.contrib import admin
from app.models import Theme, Category,Publication, Comment

# Register your models here.
admin.site.register(Theme)
admin.site.register(Category)
admin.site.register(Publication)
admin.site.register(Comment)
