#!/bin/bash

# 1. Start the Kafka-to-Redis worker in the background
python geoprocessor.py &

# 2. Start the WebSocket Heartbeat in the background
python manage.py run_heartbeat &

# 3. Start the main Django server (Frontend + API)
python manage.py runserver