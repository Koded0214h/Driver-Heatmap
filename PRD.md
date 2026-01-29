# PRD: Real-time Geospatial Heatmap (PoC)

## 1. Executive Summary

**Objective:** Build a high-concurrency service that aggregates live GPS pings from "drivers" and renders a visual density heatmap for "users" with sub-5-second latency.
**The Problem:** Rendering 100k individual points on a map crashes browsers and kills databases.
**The Solution:** Use **Geohashing** to aggregate spatial data on the backend and serve "density clusters" instead of raw points.

---

## 2. Target Features (MVP)

### 2.1 Driver Ingestion

* **Endpoint:** A WebSocket or lightweight HTTP endpoint.
* **Payload:** `{ "driverId": "string", "lat": float, "lng": float }`.
* **Frequency:** 1 ping every 3-5 seconds.

### 2.2 Heatmap Aggregation (The "Secret Sauce")

* Convert `(lat, lng)` into a **Geohash**.
* Store the count of active drivers per Geohash in **Redis**.
* **TTL (Time-to-Live):** Each driver’s presence in a cell should expire after 10 seconds of inactivity.

### 2.3 User Consumption (The Heatmap)

* Frontend requests heatmap data based on current **Zoom Level**.
* **Resolution Mapping:**
* High Zoom (City block): Precision 7 (~150m).
* Mid Zoom (City): Precision 5 (~5km).
* Low Zoom (Country): Precision 3 (~150km).



---

## 3. Technical Constraints & Architecture

### 3.1 Data Flow

1. **Source:** Simulated "Driver" script sends pings.
2. **Buffer:** Node.js receives ping -> calculates Geohash.
3. **Hot Store (Redis):** * Use a **Set** or **Key** per driver/cell combo to prevent double-counting.
* Use `SCAN` or `KEYS` (for PoC) to aggregate counts.


4. **Sink:** WebSocket broadcasts JSON object: `{ "geohash": count }`.

### 3.2 Scaling Strategy

* **Horizontal:** Node.js workers can be stateless.
* **State:** Redis handles the shared state of all drivers.

---

## 4. Success Metrics

* **Latency:** < 2s from driver ping to heatmap update.
* **Payload Size:** < 50kb for a city-wide view (achieved via Geohash grouping).
* **Stability:** Zero memory leaks in the Node.js process over 1 hour of sustained pings.

---

## 5. Proposed Tech Stack

* **Runtime:** Node.js (Express/Socket.io).
* **Database:** Redis (Essential for TTL and high-speed increments).
* **Geospatial Lib:** `ngeohash` (Standard for string-based spatial indexing).
* **Frontend:** Leaflet.js + `leaflet-heatmap` plugin.

---

## 6. Implementation Roadmap

1. **Milestone 1:** Setup Redis and a script that simulates 1,000 drivers moving in a circle.
2. **Milestone 2:** Implement the `lat/lng` to `geohash` conversion logic.
3. **Milestone 3:** Create the WebSocket "Broadcast" loop (the Heartbeat).
4. **Milestone 4:** Frontend implementation with Leaflet.