from channels.generic.websocket import AsyncWebsocketConsumer
import json

from channels.layers import channel_layers

class HeatMapConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'live_heatmap'

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def heatmap_update(self, event):
        await self.send(text_data=json.dumps(event['data']))