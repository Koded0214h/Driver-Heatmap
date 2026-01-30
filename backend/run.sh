#!/bin/bash

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down heatmap services..."
    # Kill the background process group
    kill $(jobs -p)
    echo "✅ Done. All zombies cleared."
    exit
}

# Trap Ctrl+C (SIGINT) and call the cleanup function
trap cleanup SIGINT

echo "🚀 Starting Real-Time Heatmap Infrastructure..."

# 2. Start the Worker (Redis Stream Consumer)
python geoprocessor.py &

# 3. Start the Heartbeat (WebSocket Broadcaster)

# 4. Start the Django Server (The 'foreground' process)
echo "🖥️  Django server starting at http://localhost:8000"
python manage.py runserver 127.0.0.1:8000