from django.conf.urls import url

from . import views
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    url(r'^$', views.getroot),
    url(r'^annotations/(?P<annotation_id>\S{0,64})$', csrf_exempt(views.apiEntry)),
    url(r'^annotations', csrf_exempt(views.apiEntry)),
    url(r'^search$', views.search)
]
