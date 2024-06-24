from django.urls import path

from .views import AskCreateView, AskDetailView

app_name = 'lenormand'
urlpatterns = [
    path('', AskCreateView.as_view(), name='index'),
    path('<int:pk>', AskDetailView.as_view(), name='ask-detail'),
]
