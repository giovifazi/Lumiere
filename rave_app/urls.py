from django.conf.urls import url

from . import views
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.conf.urls import include

urlpatterns = [
    # Homepage
    url(r'^$', views.index, name='index'),

    # Homepage
    url(r'^about$', views.about),

    # Django site authentication urls (login, logout, pass management)
    url(r'^accounts/', include('django.contrib.auth.urls')),

    # user registration link
    url(r'^register/$', views.register),

    # searchPage
    url(r'^search/(?P<searchTerm>\S[^/]+)/$', views.searchPage),
    url(r'^search/(?P<searchTerm>.{1})', views.searchPage),

    # Visualizer
    url(r'^visualize/(?P<searchTerm>\S[^/]+)/$', views.visualizePage),
    url(r'^visualize/(?P<searchTerm>.{1})', views.visualizePage)
]
