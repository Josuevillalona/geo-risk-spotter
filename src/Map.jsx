import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Map = () => {
  const [geojsonData, setGeojsonData] = useState(null);

  useEffect(() => {
    fetch('https://josuevillalona.github.io/geo-risk-spotter/public/ny_new_york_zip_codes_health_data.geojson')
      .then(response => response.json())
      .then(data => setGeojsonData(data))
      .catch(error => console.error('Error loading GeoJSON data:', error));
  }, []);

  return (
    <MapContainer center={[40.7128, -74.0060]} zoom={10} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Add GeoJSON layer */}
      {geojsonData && (
        <GeoJSON
          data={geojsonData}
          style={(feature) => {
            const riskScore = feature.properties.RiskScore;
            // Simple linear interpolation for color from green to red
            const color = riskScore ? `rgb(${riskScore * 255}, ${255 - riskScore * 255}, 0)` : '#808080'; // Gray for no data

            return {
              fillColor: color,
              weight: 1,
              opacity: 1,
              color: '#1f2021', // Dark gray outline
              fillOpacity: 0.7,
            };
          }}
        />
      )}
    </MapContainer>
  );
};

export default Map;
