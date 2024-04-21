from django.urls import path

from views import AskCreateView, AskDetailView

urlpatterns = [
    path('', AskCreateView.as_view()),
    path('<int:pk>', AskDetailView.as_view(), name='ask-detail'),
]
