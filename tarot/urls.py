from django.urls import path

from tarot import views

urlpatterns = [
    path('', views.index, name='index'),
]
