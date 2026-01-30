from datetime import date
import time
from django.core.management.base import BaseCommand
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from api.services.redis import get_heatmap_stats

class Command(BaseCommand):

    def handle(self, *args, **options):
        channel_layer = get_channel_layer()
        self.stdout.write(self.style.SUCCESS("💓 Heartbeat started..."))
        
        while True:
            stats = get_heatmap_stats()
            
            # Show us what's happening
            active_cells = len(stats)
            self.stdout.write(f"[HEATMAP CHANELLS{date.today().strftime("%y-%m-%d")}{time.strftime('%H:%M:%S')}] Broadcasting {active_cells} active cells.")

            async_to_sync(channel_layer.group_send)(
                "live_heatmap",
                {"type": "heatmap_update", "data": stats}
            )
            time.sleep(3)