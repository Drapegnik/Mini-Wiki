from django.conf.urls import url, include
from app.views import user_profile, profile_settings

urlpatterns = [
    url(r'^user/(?P<user_id>\d+)/profile/$', user_profile, name='user-profile'),
    url(r'^user/(?P<user_id>\d+)/profile/settings/$', profile_settings, name='profile-settings'),
    url(r'^category/(?P<category_name>\d+)$', user_profile, name='category'),
]