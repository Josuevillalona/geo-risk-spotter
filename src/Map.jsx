import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

const MapContent = ({ selectedArea, setSelectedArea, setIsLoading, setAiSummary, geojsonData, setGeojsonData, mapMoveEvent }) => {
  const map = useMap();
  const [clickedZipCode, setClickedZipCode] = useState(null);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });

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

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: async (e) => {
        // Get click position for popup
        const containerPoint = e.containerPoint;
        setClickPosition({
          x: containerPoint.x,
          y: containerPoint.y
        });
        
        // Show zip code popup
        setClickedZipCode(feature.properties.zip_code);
        
        // Set selected area and trigger AI analysis
        setSelectedArea(feature);
        setIsLoading(true);
        
        try {
          const response = await axios.post('/api/analyze', {
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
          setAiSummary('Failed to generate AI analysis');
        } finally {
          setIsLoading(false);
        }
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
      )}
      {/* Simple Zip Code Popup */}
      {clickedZipCode && (
        <div
          style={{
            position: 'absolute',
            left: `${clickPosition.x}px`,
            top: `${clickPosition.y - 60}px`,
            backgroundColor: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 1000,
            fontSize: '14px',
            fontWeight: '500',
            color: '#333',
            border: '1px solid #ddd',
            pointerEvents: 'none',
            transform: 'translateX(-50%)'
          }}
        >
          Zip Code: {clickedZipCode}
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '0',
              height: '0',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid white'
            }}
          />
        </div>
      )}
    </>
  );
};

const Map = ({ selectedArea, setSelectedArea, setIsLoading, setAiSummary, mapMoveEvent }) => {
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
    <div style={{ position: 'relative', height: '500px', width: '100%' }}>
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
        />
      </MapContainer>
    </div>
  );
};

export default Map;
