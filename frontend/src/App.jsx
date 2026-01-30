import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import { useHeatmapSocket } from './components/useHeatmapSocket';
import './App.css';

function App() {
  const points = useHeatmapSocket('ws://localhost:8000/ws/live_heatmap/');
  const [stats, setStats] = useState({
    totalDrivers: 0,
    activeZones: 0,
    peakActivity: 0
  });

  useEffect(() => {
    if (points.length > 0) {
      const maxActivity = Math.max(...points.map(p => p[2]));
      setStats({
        totalDrivers: points.reduce((sum, p) => sum + p[2], 0),
        activeZones: points.length,
        peakActivity: maxActivity
      });
    }
  }, [points]);

  return (
    <div className="app">
      <div className="app-header">
        <div className="header-content">
          <div className="brand">
            <div className="brand-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
              </svg>
            </div>
            <div className="brand-text">
              <h1 className="brand-title">LIVE TRACKER</h1>
              <p className="brand-subtitle">Real-time Driver Monitoring</p>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon drivers">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalDrivers.toLocaleString()}</div>
                <div className="stat-label">Total Activity</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon zones">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.activeZones}</div>
                <div className="stat-label">Active Zones</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon peak">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.peakActivity}</div>
                <div className="stat-label">Peak Activity</div>
              </div>
            </div>
          </div>

          <div className="status-indicator">
            <div className={`status-dot ${points.length > 0 ? 'active' : 'inactive'}`}></div>
            <span className="status-text">
              {points.length > 0 ? 'Live Feed Active' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      <MapView points={points} />

      <div className="app-footer">
        <div className="footer-info">
          <span className="footer-text">Last Updated: {new Date().toLocaleTimeString()}</span>
          <span className="footer-divider">•</span>
          <span className="footer-text">Lagos, Nigeria</span>
        </div>
      </div>
    </div>
  );
}

export default App;