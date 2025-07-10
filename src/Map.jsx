import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from './store';
import MapPopup from './MapPopup';

// API endpoints
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://geo-risk-spotter.onrender.com' 
  : 'http://localhost:8000';

// --- Refactored MapContent: delegates popup to MapPopup, helpers extracted ---
const MapContent = ({ selectedArea, setSelectedArea, setIsLoading, setAiSummary, geojsonData, setGeojsonData, mapMoveEvent, sidebarOpen, setSidebarOpen, showSearchPopup, searchPopupData, setSearchPopupData }) => {
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

  // Handle search popup positioning when area is selected
  useEffect(() => {
    if (showSearchPopup && selectedArea && searchPopupData) {
      // Position popup in center of map when triggered by search
      const mapCenter = map.getCenter();
      const centerPoint = map.latLngToContainerPoint(mapCenter);
      setClickPosition({ x: centerPoint.x, y: centerPoint.y });
      setSelectedFeature(selectedArea);
      setClickedZipCode(searchPopupData.zipCode);
      
      // Auto-hide popup after 5 seconds
      const timer = setTimeout(() => {
        setClickedZipCode(null);
        setSelectedFeature(null);
        if (setSearchPopupData) {
          setSearchPopupData(null);
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showSearchPopup, selectedArea, searchPopupData, map, setSearchPopupData]);

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

  const geoJsonStyle = (feature) => ({
    fillColor: getRiskScoreColor(feature.properties.RiskScore),
    weight: 1,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7,
  });

  // Only handles API and state, not popup rendering
  const analyzeArea = async (feature) => {
    setIsLoading(true);
    try {
      if (!navigator.onLine) throw new Error('offline');
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

  // Handles feature events, sets popup state
  const onEachFeature = (feature, layer) => {
    layer.on({
      click: async (e) => {
        const containerPoint = e.containerPoint;
        setClickPosition({ x: containerPoint.x, y: containerPoint.y });
        setSelectedFeature(feature);
        setClickedZipCode(feature.properties.zip_code);
        setSelectedArea(feature);
        await analyzeArea(feature);
      },
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({ weight: 2, color: '#666', dashArray: '', fillOpacity: 0.9 });
        layer.bringToFront();
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle(geoJsonStyle(feature));
      },
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
      )}
      {/* Enhanced Zip Code Popup (delegated) */}
      <MapPopup
        clickedZipCode={clickedZipCode}
        selectedFeature={selectedFeature}
        clickPosition={clickPosition}
      />
    </>
  );
};

const Map = ({ selectedArea, setSelectedArea, setIsLoading, setAiSummary, mapMoveEvent, sidebarOpen, setSidebarOpen, showSearchPopup, searchPopupData, setSearchPopupData }) => {
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
          showSearchPopup={showSearchPopup}
          searchPopupData={searchPopupData}
          setSearchPopupData={setSearchPopupData}
        />
      </MapContainer>
    </div>
  );
};

export default Map;
