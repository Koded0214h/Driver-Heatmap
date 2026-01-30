# 🗺️ Real-Time Driver Heatmap Pipeline

A high-performance, distributed system designed to visualize 10,000+ concurrent driver locations in real-time. This project uses a **Producer-Consumer** architecture to ensure the web server remains responsive while processing heavy geospatial data.

## 🏗️ Architecture Overiew

The system is decoupled into four distinct stages:

1.  **Ingestion (Producer):** Django REST views receive GPS pings and immediately offload them to a **Redis Stream**.
2.  **Processing (Worker):** A standalone Python worker consumes the stream, encodes coordinates into **Geohashes**, and stores them in a **Redis Sorted Set (ZSET)**.
3.  **Aggregation:** Data in Redis is automatically pruned using timestamps. The ZSET allows $O(\log N)$ complexity for spatial lookups.
4.  **Broadcast (Heartbeat):** A Django Management command aggregates cell counts and broadcasts them every 3 seconds via **WebSockets (Django Channels)**.



---

## 📂 Backend Core Components

- [**`api/views.py`**](./api/views.py): REST endpoints for driver location ingestion and system configuration.
- [**`api/services/producers.py`**](./api/services/producers.py): Logic for pushing raw GPS data into the Redis Stream buffer.
- [**`geoprocessor.py`**](./geoprocessor.py): The "Brain." Consumes streams, handles geohashing, and manages the hot-storage state.
- [**`api/services/redis.py`**](./api/services/redis.py): Interface for Sorted Set operations and heatmap statistics calculation.
- [**`management/commands/run_heartbeat.py`**](./api/management/commands/run_heartbeat.py): The WebSocket engine that pushes data to the frontend.
- [**`api/services/consumers.py`**](./api/services/consumers.py): Django Channels logic for handling persistent user connections.

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.12+
- Redis Server (`brew install redis` or `sudo apt install redis`)

### 2. Installation
```bash
git clone https://github.com/Koded0214h/Driver-Heatmap.git
cd heatmap/backend

# activate the virtual envronment
python -m venv .venv
source .venv/bin/activate

# install dependencies
pip install -r requirements.txt

# Make migrations
python manage.py makemigrations
python manage.py migrate

# Simulate 10,000 Drivers
python simulate.py
```

### 3. Running the System
You can use the provided orchestration script:

```bash
chmod +x run.sh
./run.sh
```
This will start:
>
> * Redis Server (Port 6379)
> * WebSocket Heartbeat
> * Django Development Server
> * Geoprocessor Worker
> 


## 🛠️ Tech Stack

*   Backend: Django, Django REST Framework
*   Real-Time: Django Channels (ASGI), Daphne
*   In-Memory Store: Redis (Streams & Sorted Sets)
*   Geospatial: Python-Geohash