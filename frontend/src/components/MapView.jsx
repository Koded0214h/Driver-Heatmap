import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

// Custom animated car marker
const createCarIcon = (rotation = 0, intensity = 1) => {
  const color = intensity > 3 ? '#00ff88' : intensity > 2 ? '#38bdf8' : '#facc15';
  const pulseSize = intensity > 3 ? 'large' : intensity > 2 ? 'medium' : 'small';
  
  return L.divIcon({
    className: 'custom-car-marker',
    html: `
      <div class="car-marker-wrapper" style="transform: rotate(${rotation}deg)">
        <div class="car-pulse ${pulseSize}"></div>
        <div class="car-icon" style="background: ${color}; box-shadow: 0 0 20px ${color};">
          <svg viewBox="0 0 24 24" fill="currentColor" style="width: 100%; height: 100%;">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        </div>
        <div class="car-trail"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Component to handle animated markers
const AnimatedMarkers = ({ points }) => {
  const map = useMap();
  const markersRef = useRef({});
  const animationRef = useRef({});

  useEffect(() => {
    console.log('🚗 AnimatedMarkers effect - points:', points.length, 'map:', !!map);
    if (!map || !points || points.length === 0) {
      console.log('⚠️ Skipping marker creation - missing requirements');
      return;
    }
    
    console.log('✅ Creating/updating markers for', points.length, 'points');

    // Clear old markers that are no longer in points
    const currentKeys = new Set(points.map(([lat, lng, intensity]) => `${lat},${lng}`));
    
    Object.keys(markersRef.current).forEach(key => {
      if (!currentKeys.has(key)) {
        if (markersRef.current[key]) {
          map.removeLayer(markersRef.current[key]);
          delete markersRef.current[key];
          delete animationRef.current[key];
        }
      }
    });

    // Add or update markers
    points.forEach(([lat, lng, intensity]) => {
      const key = `${lat},${lng}`;
      
      if (!markersRef.current[key]) {
        // Create new marker with random initial rotation
        const rotation = Math.random() * 360;
        const marker = L.marker([lat, lng], {
          icon: createCarIcon(rotation, intensity),
          zIndexOffset: intensity * 100,
        }).addTo(map);

        console.log('🚙 Created new marker at', lat, lng, 'with intensity', intensity);

        // Add popup with info
        marker.bindPopup(`
          <div class="car-popup">
            <div class="popup-title">Active Driver</div>
            <div class="popup-stat">
              <span class="popup-label">Activity Level:</span>
              <span class="popup-value">${intensity}</span>
            </div>
            <div class="popup-stat">
              <span class="popup-label">Location:</span>
              <span class="popup-value">${lat.toFixed(4)}, ${lng.toFixed(4)}</span>
            </div>
          </div>
        `);

        markersRef.current[key] = marker;
        animationRef.current[key] = {
          rotation: rotation,
          targetLat: lat,
          targetLng: lng,
          currentLat: lat,
          currentLng: lng,
          velocity: {
            lat: (Math.random() - 0.5) * 0.0001,
            lng: (Math.random() - 0.5) * 0.0001,
          }
        };
      } else {
        // Update existing marker's target position
        animationRef.current[key].targetLat = lat;
        animationRef.current[key].targetLng = lng;
      }
    });
    
    console.log('📊 Total markers on map:', Object.keys(markersRef.current).length);

    // Animation loop
    let animationFrameId;
    const animate = () => {
      Object.entries(animationRef.current).forEach(([key, anim]) => {
        const marker = markersRef.current[key];
        if (!marker) return;

        // Smooth movement towards target
        const latDiff = anim.targetLat - anim.currentLat;
        const lngDiff = anim.targetLng - anim.currentLng;
        
        // Add some organic wandering
        anim.velocity.lat += (Math.random() - 0.5) * 0.00001;
        anim.velocity.lng += (Math.random() - 0.5) * 0.00001;
        
        // Dampen velocity
        anim.velocity.lat *= 0.95;
        anim.velocity.lng *= 0.95;
        
        // Move towards target with some organic motion
        anim.currentLat += latDiff * 0.02 + anim.velocity.lat;
        anim.currentLng += lngDiff * 0.02 + anim.velocity.lng;
        
        // Calculate rotation based on movement direction
        const angle = Math.atan2(lngDiff, latDiff) * (180 / Math.PI);
        anim.rotation = angle + 90; // Adjust for car icon orientation
        
        // Update marker position and icon
        const intensity = points.find(([lat, lng]) => 
          `${lat},${lng}` === key
        )?.[2] || 1;
        
        marker.setLatLng([anim.currentLat, anim.currentLng]);
        marker.setIcon(createCarIcon(anim.rotation, intensity));
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [map, points]);

  return null;
};

// Heatmap layer
const HeatLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    // Create a custom canvas overlay for glowing trails
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const updateCanvas = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      points.forEach(([lat, lng, intensity]) => {
        const point = map.latLngToContainerPoint([lat, lng]);
        const radius = 30 + intensity * 10;
        
        // Create glow effect
        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
        gradient.addColorStop(0, `rgba(0, 255, 136, ${0.3 * (intensity / 5)})`);
        gradient.addColorStop(0.5, `rgba(56, 189, 248, ${0.2 * (intensity / 5)})`);
        gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2);
      });
    };

    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '400';
    
    map.getContainer().appendChild(canvas);
    
    updateCanvas();
    map.on('move zoom', updateCanvas);

    return () => {
      map.off('move zoom', updateCanvas);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [map, points]);

  return null;
};

const MapView = ({ points }) => {
  return (
    <div className="map-view-container">
      <MapContainer
        center={[6.5244, 3.3792]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        
        {points.length > 0 && (
          <>
            <HeatLayer points={points} />
            <AnimatedMarkers points={points} />
          </>
        )}
      </MapContainer>
      
      {points.length === 0 && (
        <div className="map-overlay">
          <div className="loading-state">
            <div className="radar-pulse"></div>
            <div className="loading-text">Scanning for drivers...</div>
            <div className="loading-subtext">Connecting to live feed</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;