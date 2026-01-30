# api/routing.py
from django.urls import path
from .services.consumers import HeatMapConsumer

websocket_urlpatterns = [
    # Change .as_view() to .as_asgi()
    path('ws/live_heatmap/', HeatMapConsumer.as_asgi()), 
]