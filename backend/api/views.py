from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .services.producers import stream_driver_location
from .services.redis import r  # Importing the redis client for health checks

class DriverLocationUpdateView(APIView):
    """
    Ingestion point for driver pings. 
    Offloads to Kafka immediately to maintain high availability.
    """
    def post(self, request):
        driver_id = request.data.get('driver_id')
        lat = request.data.get('lat')
        lng = request.data.get('lng')

        # 1. Validation
        if not all([driver_id, lat, lng]):
            return Response(
                {"error": "Missing driver_id, lat, or lng"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # 2. Produce to Kafka (Async)
            stream_driver_location(driver_id, float(lat), float(lng))
            
            # 3. Respond with 202 Accepted
            return Response({"status": "received"}, status=status.HTTP_202_ACCEPTED)
            
        except ValueError:
            return Response({"error": "Invalid coordinates"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Log this error in a real app
            return Response({"error": "Ingestion failure"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class HeatmapConfigView(APIView):
    """
    Returns settings to the frontend so the UI stays in sync with backend logic.
    """
    def get(self, request):
        config = {
            "refresh_rate_seconds": 3,
            "geohash_precision": 7,
            "zoom_levels": {
                "high": 7,
                "medium": 5,
                "low": 3
            }
        }
        return Response(config, status=status.HTTP_200_OK)

class SystemHealthView(APIView):
    """
    Operational endpoint to check if downstream dependencies are alive.
    """
    def get(self, request):
        health = {"status": "healthy", "checks": {}}
        
        # Check Redis
        try:
            r.ping()
            health["checks"]["redis"] = "OK"
        except Exception:
            health["status"] = "unhealthy"
            health["checks"]["redis"] = "FAIL"
            
        # Add Kafka check here if needed via producer.list_topics()
        
        status_code = status.HTTP_200_OK if health["status"] == "healthy" else status.HTTP_503_SERVICE_UNAVAILABLE
        return Response(health, status=status_code)