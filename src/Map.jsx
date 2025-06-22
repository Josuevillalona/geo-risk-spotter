import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from './store';

// API endpoints
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://geo-risk-spotter.onrender.com' 
  : 'http://localhost:8000';

const MapContent = ({ selectedArea, setSelectedArea, setIsLoading, setAiSummary, geojsonData, setGeojsonData, mapMoveEvent, sidebarOpen, setSidebarOpen }) => {
  const map = useMap();
  const [clickedZipCode, setClickedZipCode] = useState(null);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    if (selectedArea && mapMoveEvent) {
      const bounds = L.geoJSON(selectedArea).getBounds();
      if (bounds.isValid()) {
        map.flyToBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [mapMoveEvent, selectedArea, map]);

  // Function to determine color based on RiskScore (Green-Yellow-Red scale)
  const getRiskScoreColor = (score) => {
    if (score == null || isNaN(score)) return '#cccccc';
    
    return score > 25.0 ? '#a50f15' :
           score > 20.01 ? '#de2d26' :
           score > 18.48 ? '#fb6a4a' :
           score > 16.34 ? '#fcae91' :
           score > 10.0 ? '#fee613' :
           score > 5.0 ? '#a1d99b' :
                        '#41ab5d';
  };

  const geoJsonStyle = (feature) => {
    return {
      fillColor: getRiskScoreColor(feature.properties.RiskScore),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  const analyzeArea = async (feature) => {
    setIsLoading(true);
    try {
      if (!navigator.onLine) {
        throw new Error('offline');
      }

      const response = await axios.post(`${API_BASE_URL}/api/analyze`, {
        zip_code: feature.properties.zip_code,
        RiskScore: feature.properties.RiskScore,
        DIABETES_CrudePrev: feature.properties.DIABETES_CrudePrev,
        OBESITY_CrudePrev: feature.properties.OBESITY_CrudePrev,
        LPA_CrudePrev: feature.properties.LPA_CrudePrev,
        CSMOKING_CrudePrev: feature.properties.CSMOKING_CrudePrev,
        BPHIGH_CrudePrev: feature.properties.BPHIGH_CrudePrev,
        FOODINSECU_CrudePrev: feature.properties.FOODINSECU_CrudePrev,
        ACCESS2_CrudePrev: feature.properties.ACCESS2_CrudePrev,
      });
      
      setAiSummary(response.data.summary);
    } catch (error) {
      console.error('Error fetching AI analysis:', error);
      let errorMessage = 'Failed to generate AI analysis. ';
      
      if (error.message === 'offline' || !navigator.onLine) {
        errorMessage = 'Unable to connect to the analysis server. Please check your internet connection and try again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Analysis service is currently unavailable. Please try again later.';
      } else if (error.response) {
        errorMessage = 'The analysis server encountered an error. Please try again later.';
      }
      
      setAiSummary(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for enhanced popup
  const formatPercent = (value) => {
    if (value === undefined || value === null || value === '') return '0.0%';
    const num = Number(value);
    if (isNaN(num)) return '0.0%';
    return `${num.toFixed(1)}%`;
  };

  const getRiskLevel = (score) => {
    if (score >= 20) return { level: 'high', color: '#dc2626', icon: '🔴' };
    if (score >= 15) return { level: 'medium-high', color: '#f59e0b', icon: '🟠' };
    if (score >= 10) return { level: 'medium', color: '#eab308', icon: '🟡' };
    return { level: 'low', color: '#16a34a', icon: '🟢' };
  };

  const getMetricRisk = (value, type) => {
    const num = Number(value) || 0;
    if (type === 'diabetes') {
      if (num >= 12) return { color: '#dc2626', icon: '🔴' };
      if (num >= 8) return { color: '#f59e0b', icon: '🟠' };
      return { color: '#16a34a', icon: '🟢' };
    }
    if (type === 'obesity') {
      if (num >= 30) return { color: '#dc2626', icon: '🔴' };
      if (num >= 25) return { color: '#f59e0b', icon: '🟠' };
      return { color: '#16a34a', icon: '🟢' };
    }
    return { color: '#6b7280', icon: '⚪' };
  };
  const onEachFeature = (feature, layer) => {
    layer.on({
      click: async (e) => {
        // Get click position for popup
        const containerPoint = e.containerPoint;
        setClickPosition({
          x: containerPoint.x,
          y: containerPoint.y
        });
        
        // Store selected feature data for enhanced popup
        setSelectedFeature(feature);
        setClickedZipCode(feature.properties.zip_code);
        
        // Set selected area and trigger AI analysis
        setSelectedArea(feature);
        
        await analyzeArea(feature);
      },
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 2,
          color: '#666',
          dashArray: '',
          fillOpacity: 0.9
        });
        layer.bringToFront();
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle(geoJsonStyle(feature));
      }
    });
  };

  return (
    <>
      {geojsonData && (
        <GeoJSON
          data={geojsonData}
          style={geoJsonStyle}
          onEachFeature={onEachFeature}
        />
      )}      {/* Enhanced Zip Code Popup */}
      {clickedZipCode && selectedFeature && (
        <div
          style={{
            position: 'absolute',
            left: `${clickPosition.x}px`,
            top: `${clickPosition.y - 120}px`,
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 1000,
            border: '1px solid #e5e7eb',
            pointerEvents: 'none',
            transform: 'translateX(-50%)',
            minWidth: '280px',
            maxWidth: '320px'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f8fafc',
            borderRadius: '8px 8px 0 0'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📍 Zip Code {clickedZipCode}
            </div>
          </div>

          {/* Metrics */}
          <div style={{ padding: '16px' }}>
            {/* Risk Score */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              padding: '8px 12px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px'
            }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Risk Score:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ 
                  fontSize: '16px', 
                  fontWeight: '600',
                  color: getRiskLevel(selectedFeature.properties.RiskScore).color 
                }}>
                  {selectedFeature.properties.RiskScore?.toFixed(1) || 'N/A'}
                </span>
                <span>{getRiskLevel(selectedFeature.properties.RiskScore).icon}</span>
              </div>
            </div>

            {/* Key Metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                  Diabetes:
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: getMetricRisk(selectedFeature.properties.DIABETES_CrudePrev, 'diabetes').color 
                  }}>
                    {formatPercent(selectedFeature.properties.DIABETES_CrudePrev)}
                  </span>
                  <span style={{ fontSize: '12px' }}>
                    {getMetricRisk(selectedFeature.properties.DIABETES_CrudePrev, 'diabetes').icon}
                  </span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                  Obesity:
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: getMetricRisk(selectedFeature.properties.OBESITY_CrudePrev, 'obesity').color 
                  }}>
                    {formatPercent(selectedFeature.properties.OBESITY_CrudePrev)}
                  </span>
                  <span style={{ fontSize: '12px' }}>
                    {getMetricRisk(selectedFeature.properties.OBESITY_CrudePrev, 'obesity').icon}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Popup Arrow */}
          <div
            style={{
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '0',
              height: '0',
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid white'
            }}
          />
        </div>
      )}
    </>
  );
};

const Map = ({ selectedArea, setSelectedArea, setIsLoading, setAiSummary, mapMoveEvent, sidebarOpen, setSidebarOpen }) => {
  const [geojsonData, setGeojsonData] = useState(null);

  useEffect(() => {
    fetch('https://geo-risk-spotspot-geojson.s3.us-east-1.amazonaws.com/ny_new_york_zip_codes_health.geojson')
      .then(response => response.json())
      .then(data => {
        setGeojsonData(data);
      })
      .catch(error => console.error('Error loading GeoJSON data:', error));
  }, []);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer
        center={[40.7128, -74.0060]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapContent
          selectedArea={selectedArea}
          setSelectedArea={setSelectedArea}
          setIsLoading={setIsLoading}
          setAiSummary={setAiSummary}
          geojsonData={geojsonData}
          setGeojsonData={setGeojsonData}
          mapMoveEvent={mapMoveEvent}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </MapContainer>
    </div>
  );
};

export default Map;
