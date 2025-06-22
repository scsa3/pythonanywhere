from django.urls import path

from tarot import views

app_name = 'tarot'
urlpatterns = [
    path('', views.index_view, name='index'),
    path('pick', views.pick, name='pick'),
    path('answer', views.answer_view, name='answer'),
]
