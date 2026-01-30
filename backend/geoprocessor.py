import redis
import json
import geohash
import time

r = redis.StrictRedis(host='localhost', port=6379, db=0)
stream_key = 'driver-locations'

print("🛰️ Geoprocessor started. Listening for Redis Stream events...")

while True:
    # Read from the stream. '$' means only new messages.
    # block=1000 means wait 1 second if no data is there.
    messages = r.xread({stream_key: '$'}, count=10, block=1000)
    
    if not messages:
        continue

    for stream, message_list in messages:
        for msg_id, payload in message_list:
            data = json.loads(payload[b'data'].decode('utf-8'))
            
            # The same logic you wrote before!
            ghash = geohash.encode(data['lat'], data['lng'], precision=7)
            r.zadd(f"heatmap:cell:{ghash}", {data['driver_id']: data['timestamp']})
            
            # Senior touch: cleanup the stream so it doesn't grow forever
            r.xdel(stream_key, msg_id)