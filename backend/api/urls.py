from django.urls import path
from .views import DriverLocationUpdateView, HeatmapConfigView, SystemHealthView

urlpatterns = [
    path('location/', DriverLocationUpdateView.as_view(), name='driver-ingestion'),
    path('config/', HeatmapConfigView.as_view(), name='heatmap-config'),
    path('health/', SystemHealthView.as_view(), name='system-health'),
]