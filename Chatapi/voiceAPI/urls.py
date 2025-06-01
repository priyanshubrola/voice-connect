from django.urls import path
from . import views

urlpatterns = [
    path('status/', views.voice_status, name='voice-status'),
    path('speak/', views.convert_speech, name='convert_speech'),
    path('listen/', views.recognize_speech, name='recognize_speech'),
    path('start/', views.start_listening, name='start_listening'),
    path('stop/', views.stop_listening, name='stop_listening'),
]
