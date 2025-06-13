import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Map = () => {
  const [geojsonData, setGeojsonData] = useState(null);

  useEffect(() => {
    fetch('/public/ny_new_york_zip_codes_health.geojson')
      .then(response => response.json())
      .then(data => setGeojsonData(data))
      .catch(error => console.error('Error loading GeoJSON data:', error));
  }, []);

  // Function to determine color based on RiskScore
  const getRiskScoreColor = (score) => {
    return score > 0.6 ? '#800026' :
           score > 0.5 ? '#BD0026' :
           score > 0.4 ? '#E31A1C' :
           score > 0.3 ? '#FC4E2A' :
           score > 0.2 ? '#FD8D3C' :
           score > 0.1 ? '#FEB24C' :
                         '#FFEDA0';
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

  return (
    <MapContainer center={[40.7128, -74.0060]} zoom={10} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Add GeoJSON layer with choropleth styling */}
      {geojsonData && (
        <GeoJSON
          data={geojsonData}
          style={geoJsonStyle}
        />
      )}
    </MapContainer>
  );
};

export default Map;
