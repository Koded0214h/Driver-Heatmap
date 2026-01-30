# Frontend README

# 📍 Live Heatmap Frontend

The user-facing side of the real-time driver density tracker. This React application connects to a Django Channels WebSocket to visualize driver movements across Lagos in real-time using a heatmap layer.

## 🚀 Features

* **Real-time Synchronization**: Latency-free updates via WebSockets.
* **Geohash Decoding**: Efficiently transforms backend geohashes into map coordinates using `ngeohash`.
* **Dynamic Heatmap**: Uses `Leaflet.heat` for smooth, high-performance rendering of data density.
* **Resilient Connection**: Handles map initialization states to prevent canvas rendering errors.

## 🛠 Tech Stack

* **React** (Vite)
* **Leaflet & React-Leaflet** (Mapping)
* **ngeohash** (Geospatial utility)
* **WebSockets** (Native Browser API)

## 📦 Installation

1. **Install dependencies**:
```bash
npm install

```


2. **Required Libraries**:
If not already installed, ensure you have:
```bash
npm install leaflet react-leaflet leaflet.heat ngeohash

```



## 🖥 Development

1. **Start the development server**:
```bash
npm run dev

```


2. **Configure Backend URL**:
Ensure the WebSocket URL in `useHeatmapSocket.js` points to your running Django server:
`ws://127.0.0.1:8000/ws/live_heatmap/`

## 💡 Troubleshooting

* **Canvas width 0**: This error occurs if the heatmap tries to render before the map container has a size. The `mapReady` state in `MapView.jsx` handles this.
* **Connection Refused**: Ensure the Django server is running with `daphne` or `runserver` (with Channels configured) on port 8000.