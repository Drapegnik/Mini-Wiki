from django.conf.urls import url, include
from django.views.generic import TemplateView
from app.views import *

urlpatterns = [
    url(r'^user/(?P<user_id>\d+)/profile/$', user_profile, name='user-profile'),
    url(r'^user/(?P<user_id>\d+)/profile/settings/$', profile_settings, name='profile-settings'),
    url(r'publications/', getPublications, name='publications'),
    url(r'^category/(?P<category_name>\d+)$', user_profile, name='category'),
    url(r'^test/$', TemplateView.as_view(template_name="Template3.html")),
]
