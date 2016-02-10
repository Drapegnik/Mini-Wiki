from django.conf.urls import url, include
from django.views.generic import TemplateView
from django.conf.urls import url
from app.views import *

urlpatterns = [
    url(r'^user/(?P<user_id>\d+)/profile/$', user_profile, name='user-profile'),
    url(r'^user/(?P<user_id>\d+)/profile/settings/$', profile_settings, name='profile-settings'),
    url(r'publications/', get_publications, name='publications'),
    # url(r'^updateprofile/$', profile_settings, name='update-profile'),
    # url(r'^category/(?P<category_name>\d+)$', user_profile, name='category'),
    url(r'updatePhoto/', UpdatePhoto.as_view()),
    url(r'getProfile/', GetProfile.as_view()),
    url(r'test/$', TemplateView.as_view(template_name="Template3.html")),
    url(r'getTags/', GetTags.as_view()),
]
