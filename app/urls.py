from django.conf.urls import url, include
from authenticating.views import registration

urlpatterns = [
    url(r'', include('django.contrib.auth.urls'))
]