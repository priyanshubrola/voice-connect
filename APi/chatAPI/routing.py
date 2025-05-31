from django.urls import path

from . import consumers

websocket_urlpatterns = [
	path('chatAPI/', consumers.ChatConsumer.as_asgi())
]