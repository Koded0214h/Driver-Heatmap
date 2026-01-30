import json
import time
from confluent_kafka import Producer
from django.conf import settings
import redis

# Redis Client
r = redis.StrictRedis(host=settings.REDIS_URL, port=6379, db=0)

# Get Kafka config from settings (better practice)
# conf = {'bootstrap.servers': settings.KAFKA_BROKER_URL}
# producer = Producer(conf)

# Delivery callback for async handling
def delivery_callback(err, msg):
    if err:
        print(f'Message delivery failed: {err}')
    else:
        print(f'Message delivered to {msg.topic()} [{msg.partition()}]')

def stream_driver_location(driver_id, lat, lng):
    data = {
        "driver_id": driver_id,
        "lat": lat,
        "lng": lng,
        "timestamp": time.time()
    }
    
    # XADD adds a message to the stream 'driver-locations'
    # '*' means Redis generates the message ID automatically
    r.xadd('driver-locations', {'data': json.dumps(data)})