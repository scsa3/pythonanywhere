from django.urls import path

from tarot import views

urlpatterns = [
    path('', views.question_view, name='question'),
    path('tarot', views.tarot, name='tarot'),
    path('answer', views.answer_view, name='answer'),
]
