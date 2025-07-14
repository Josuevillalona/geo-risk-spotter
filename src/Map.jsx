import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAppStore } from './store';
import MapPopup from './MapPopup';
import MapSearchOverlay from './components/MapSearchOverlay';
import MapFilterOverlay from './components/MapFilterOverlay';
import { aggregateBoroughData, loadBoroughBoundaries, mergeBoroughDataWithBoundaries } from './services/boroughService';

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
  
  // Borough state from store
  const { selectedBorough, viewMode, boroughData, getFilteredZipCodes, isBoroughBoundariesLoading } = useAppStore();

  useEffect(() => {
    if (selectedArea && mapMoveEvent) {
      const bounds = L.geoJSON(selectedArea).getBounds();
      if (bounds.isValid()) {
        map.flyToBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [mapMoveEvent, selectedArea, map]);

  // Auto-zoom to borough bounds when borough is selected
  useEffect(() => {
    if (selectedBorough !== 'All' && boroughData && boroughData[selectedBorough]) {
      const boroughBounds = boroughData[selectedBorough].bounds;
      if (boroughBounds && boroughBounds.length === 2) {
        // Convert bounds to Leaflet format
        const bounds = L.latLngBounds(boroughBounds);
        map.flyToBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [selectedBorough, boroughData, map]);

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

  // Filter GeoJSON data based on selected borough
  const getFilteredGeoJSONData = () => {
    if (!geojsonData) return null;
    
    if (selectedBorough === 'All') {
      return geojsonData;
    }
    
    const filteredZipCodes = getFilteredZipCodes();
    if (!filteredZipCodes || filteredZipCodes.length === 0) {
      return geojsonData;
    }
    
    // Filter features to only include zip codes in selected borough
    const filteredFeatures = geojsonData.features.filter(feature => {
      const zipCode = feature.properties.zip_code;
      return filteredZipCodes.includes(zipCode);
    });
    
    return {
      ...geojsonData,
      features: filteredFeatures
    };
  };

  // Generate borough-level aggregated data for visualization
  const getBoroughGeoJSONData = () => {
    if (!geojsonData || !boroughData) return null;
    
    // Use actual borough boundaries stored in the store
    const { boroughBoundaries } = useAppStore.getState();
    
    if (!boroughBoundaries) {
      console.warn('Borough boundaries not loaded yet');
      return null;
    }
    
    console.log('Creating borough visualization with boundaries:', boroughBoundaries.features?.length, 'features');
    
    const aggregatedHealthData = aggregateBoroughData(geojsonData.features);
    const mergedData = mergeBoroughDataWithBoundaries(boroughBoundaries, aggregatedHealthData);
    
    console.log('Merged borough data:', mergedData.features?.length, 'features');
    return mergedData;
  };

  // Get appropriate data based on view mode
  const getVisualizationData = () => {
    console.log('Getting visualization data - viewMode:', viewMode, 'selectedBorough:', selectedBorough);
    
    if (viewMode === 'borough') {
      const boroughData = getBoroughGeoJSONData();
      console.log('Borough data for visualization:', boroughData?.features?.length, 'features');
      return boroughData;
    } else {
      const filteredData = getFilteredGeoJSONData();
      console.log('Filtered zip code data:', filteredData?.features?.length, 'features');
      return filteredData;
    }
  };

  const geoJsonStyle = (feature) => {
    const isBorough = feature.properties.borough;
    const riskScore = isBorough ? feature.properties.avgRiskScore : feature.properties.RiskScore;
    
    return {
      fillColor: getRiskScoreColor(riskScore),
      weight: 1, // Same weight for both zip codes and boroughs
      opacity: 1,
      color: 'white',
      dashArray: isBorough ? '0' : '3', // Keep dashes for zip codes, solid for boroughs
      fillOpacity: 0.7,
    };
  };

  // Only handles API and state, not popup rendering
  const analyzeArea = async (feature) => {
    setIsLoading(true);
    try {
      if (!navigator.onLine) throw new Error('offline');
      
      const isBorough = feature.properties.borough;
      
      // Prepare data for API call
      const analysisData = isBorough ? {
        zip_code: feature.properties.borough + " Borough",
        RiskScore: feature.properties.avgRiskScore || 0,
        DIABETES_CrudePrev: feature.properties.avgDiabetes || 0,
        OBESITY_CrudePrev: feature.properties.avgObesity || 0,
        LPA_CrudePrev: feature.properties.avgPhysicalInactivity || 0,
        CSMOKING_CrudePrev: feature.properties.avgCurrentSmoking || 0,
        BPHIGH_CrudePrev: feature.properties.avgHypertension || 0,
        FOODINSECU_CrudePrev: feature.properties.avgFoodInsecurity || 0,
        ACCESS2_CrudePrev: feature.properties.avgHealthcareAccess || 0,
      } : {
        zip_code: feature.properties.ZCTA5CE10,
        RiskScore: feature.properties.RiskScore,
        DIABETES_CrudePrev: feature.properties.DIABETES_CrudePrev,
        OBESITY_CrudePrev: feature.properties.OBESITY_CrudePrev,
        LPA_CrudePrev: feature.properties.LPA_CrudePrev,
        CSMOKING_CrudePrev: feature.properties.CSMOKING_CrudePrev,
        BPHIGH_CrudePrev: feature.properties.BPHIGH_CrudePrev,
        FOODINSECU_CrudePrev: feature.properties.FOODINSECU_CrudePrev,
        ACCESS2_CrudePrev: feature.properties.ACCESS2_CrudePrev,
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/analyze`, analysisData);
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

  // Handles feature events, sets popup state - Fixed click handler
  const onEachFeature = (feature, layer) => {
    layer.on({
      click: async (e) => {
        const containerPoint = e.containerPoint;
        setClickPosition({ x: containerPoint.x, y: containerPoint.y });
        setSelectedFeature(feature);
        
        // Set appropriate display identifier
        const displayId = feature.properties.borough 
          ? feature.properties.borough 
          : feature.properties.zip_code;
        setClickedZipCode(displayId);
        
        setSelectedArea(feature);
        await analyzeArea(feature);
      },
      mouseover: (e) => {
        const layer = e.target;
        const isBorough = feature.properties.borough;
        if (isBorough) {
          // Borough hover style - match zip code behavior
          layer.setStyle({ 
            weight: 3, 
            color: '#666', 
            dashArray: '', 
            fillOpacity: 0.9 
          });
        } else {
          // Zip code hover style (existing)
          layer.setStyle({ 
            weight: 2, 
            color: '#666', 
            dashArray: '', 
            fillOpacity: 0.9 
          });
        }
        layer.bringToFront();
      },
      mouseout: (e) => {
        const layer = e.target;
        // Reset to original style for both boroughs and zip codes
        layer.setStyle(geoJsonStyle(feature));
      },
    });
  };

  const visualizationData = getVisualizationData();

  return (
    <>
      {visualizationData && (
        <GeoJSON
          key={`${selectedBorough}-${viewMode}`} // Force re-render when borough or view mode changes
          data={visualizationData}
          style={geoJsonStyle}
          onEachFeature={onEachFeature}
        />
      )}
      {/* Enhanced Zip Code Popup (delegated) */}
      <MapPopup
        clickedZipCode={clickedZipCode}
        selectedFeature={selectedFeature}
        clickPosition={clickPosition}
        onClose={() => setClickedZipCode(null)}
      />
    </>
  );
};

const Map = ({ selectedArea, setSelectedArea, setIsLoading, setAiSummary, mapMoveEvent, sidebarOpen, setSidebarOpen, showSearchPopup, searchPopupData, setSearchPopupData }) => {
  const [geojsonData, setGeojsonData] = useState(null);
  
  // Get loading states from store
  const { viewMode, isBoroughBoundariesLoading, isZipCodeDataLoading, setIsZipCodeDataLoading } = useAppStore();

  // Function to trigger map movement for search results
  const triggerMapMove = (feature) => {
    if (feature && feature.geometry) {
      setSelectedArea(feature);
      // This will trigger the mapMoveEvent effect in MapContent
    }
  };

  useEffect(() => {
    setIsZipCodeDataLoading(true);
    fetch('https://geo-risk-spotspot-geojson.s3.us-east-1.amazonaws.com/ny_new_york_zip_codes_health.geojson')
      .then(response => response.json())
      .then(data => {
        setGeojsonData(data);
      })
      .catch(error => {
        console.error('Error loading GeoJSON data:', error);
        // Try fallback to local file
        return fetch('/ny_new_york_zip_codes_geo.min.json')
          .then(response => response.json())
          .then(fallbackData => {
            setGeojsonData(fallbackData);
            console.log('Loaded zip code data from local fallback');
          });
      })
      .finally(() => {
        setIsZipCodeDataLoading(false);
      });
  }, [setIsZipCodeDataLoading]);

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
      
      {/* Map overlays */}
      <MapSearchOverlay 
        triggerMapMove={triggerMapMove}
      />
      <MapFilterOverlay />
      
      {/* Borough boundaries loading overlay */}
      {viewMode === 'borough' && isBoroughBoundariesLoading && (
        <div className="map-loading-overlay">
          <div className="map-loading-content">
            <div className="loading-spinner"></div>
            <span>Loading borough boundaries...</span>
          </div>
        </div>
      )}
      
      {/* Zip code data loading overlay */}
      {viewMode === 'zipcode' && isZipCodeDataLoading && (
        <div className="map-loading-overlay">
          <div className="map-loading-content">
            <div className="loading-spinner"></div>
            <span>Loading zip code data...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
