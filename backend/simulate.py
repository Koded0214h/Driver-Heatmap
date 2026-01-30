import requests
import time
import random

API_URL = "http://localhost:8000/api/location/"
LAGOS_CENTER = (6.5244, 3.3792)

# Create 100 drivers with unique IDs and initial positions
drivers = []
for i in range(100):
    drivers.append({
        "id": f"driver_{i}",
        "lat": LAGOS_CENTER[0] + random.uniform(-0.05, 0.05),
        "lng": LAGOS_CENTER[1] + random.uniform(-0.05, 0.05)
    })

print(f"🏎️ Simulating 100 drivers. Sending pings to {API_URL}...")

try:
    while True:
        for driver in drivers:
            # Move them slightly (random walk)
            driver["lat"] += random.uniform(-0.001, 0.001)
            driver["lng"] += random.uniform(-0.001, 0.001)

            payload = {
                "driver_id": driver["id"],
                "lat": driver["lat"],
                "lng": driver["lng"]
            }
            
            # Fire and forget
            try:
                requests.post(API_URL, json=payload, timeout=0.1)
            except:
                pass 
        
        print(f"📡 Batch update sent at {time.strftime('%H:%M:%S')}")
        time.sleep(2)

except KeyboardInterrupt:
    print("\nStopping simulation...")