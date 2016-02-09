from django.conf.urls import url, include

from authenticating.views import registration, login

urlpatterns = [
    url(r'^register/$', registration, name='register'),
    url(r'^login/$', login, name='mylogin'),
    url(r'', include('django.contrib.auth.urls')),
    url(r'', include('social.apps.django_app.urls', namespace='social'))
]
