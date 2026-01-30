import { useState, useEffect } from 'react';
import geohash from 'ngeohash';

export const useHeatmapSocket = (url) => {
    const [points, setPoints] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('connecting');

    useEffect(() => {
        console.log('🔌 Connecting to WebSocket:', url);
        const socket = new WebSocket(url);

        socket.onopen = () => {
            console.log('✅ WebSocket connected');
            setConnectionStatus('connected');
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('📨 Received data:', data);
                
                // Check if data has keys before processing
                if (data && Object.keys(data).length > 0) {
                    const transformed = Object.entries(data).map(([hash, count]) => {
                        // Use the library to decode the hash
                        const { latitude, longitude } = geohash.decode(hash);
                        
                        console.log(`📍 Decoded: ${hash} → [${latitude}, ${longitude}] = ${count}`);
                        
                        // Leaflet-heat expects: [lat, lng, intensity]
                        return [latitude, longitude, count]; 
                    });
                    
                    console.log(`✨ Transformed ${transformed.length} points`);
                    setPoints(transformed);
                } else {
                    console.log('⚠️ Empty or invalid data received');
                }
            } catch (error) {
                console.error('❌ Error parsing WebSocket message:', error);
            }
        };

        socket.onerror = (err) => {
            console.error("❌ WebSocket Error:", err);
            setConnectionStatus('error');
        };

        socket.onclose = () => {
            console.log('🔌 WebSocket closed');
            setConnectionStatus('closed');
        };

        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, [url]);

    // Log current state
    useEffect(() => {
        console.log(`📊 Current points: ${points.length}`, points.slice(0, 3));
    }, [points]);

    return points;
};