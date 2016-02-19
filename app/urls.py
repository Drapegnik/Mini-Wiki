from django.views.generic import TemplateView
from django.conf.urls import url, include
from app.views import *

urlpatterns = [
    url(r'user/(?P<user_id>\d+)/profile/$', user_profile, name='user-profile'),
    url(r'user/(?P<user_id>\d+)/profile/settings/$', profile_settings, name='profile-settings'),
    url(r'publications/', get_publications, name='publications'),
    url(r'updatePhoto/', UpdatePhoto.as_view()),
    url(r'getProfile/', GetProfile.as_view()),
    url(r'createpublication/(?P<template_id>\d+)/change/(?P<prev_id>\d+)/$', AddPublication.as_view(),
        name='create-publication'),
    url(r'getTags/', GetTags.as_view()),
    url(r'makepublication/', MakePublication.as_view(), name='edit'),
    url(r'createcomment/', CreateComment.as_view(), name='create-comment'),
    url(r'articles/(?P<publication_id>\d+)/$', ShowPublication.as_view(), name='show'),
    url(r'comments/', GetComments.as_view(), name='comments'),
    url(r'vote/', VotesController.as_view(), name='vote'),
    url(r'search/', MySearchView(), name='search'),
    url(r'delete/(?P<publication_id>\d+)/$', DeletePublication.as_view(), name='delete'),
]
