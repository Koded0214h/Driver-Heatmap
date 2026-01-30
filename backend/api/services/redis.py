import time
import redis
import geohash
from django.conf import settings

r = redis.StrictRedis(host=settings.REDIS_URL, port=6379, db=0)

def record_driver_location(driver_id, lat, lng):
    ghash = geohash.encode(lat, lng, precision=7)
    now = time.time()

    r.zadd(f"heatmap:cell:{ghash}", {driver_id: now})

    r.expire(f"heatmap:cell:{ghash}", 60)

def get_heatmap_stats(precision=7):
    cells = r.keys(f"heatmap:cell:*")
    results = {}
    now = time.time()
    
    for cell_key in cells:
        # Remove pings older than 30 seconds
        r.zremrangebyscore(cell_key, 0, now - 30)

        # Get count of remaining active drivers
        count = r.zcard(cell_key)
        if count > 0:
            results[cell_key.decode().split(':')[-1]] = count  
    
    return results

def update_heatmap_in_redis(geohash, driver_id):

    r.zadd(f"heatmap:cell:{geohash}", {driver_id: time.time()})

    now = time.time()
    