import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Map = () => {
  const [geojsonData, setGeojsonData] = useState(null);

  useEffect(() => {
    fetch('/ny_new_york_zip_codes_health_data.geojson')
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
            let fillColor = '#cccccc'; // Default color for no data

            if (riskScore !== null && riskScore !== undefined) {
              // Simple color scale based on RiskScore (adjust as needed)
              if (riskScore > 30) {
                fillColor = '#bd0026'; // High risk (dark red)
              } else if (riskScore > 20) {
                fillColor = '#f03b20'; // Medium-high risk (red)
              } else if (riskScore > 10) {
                fillColor = '#fd8d3c'; // Medium risk (orange)
              } else {
                fillColor = '#fed976'; // Low risk (light orange)
              }
            }

            return {
              fillColor: fillColor,
              weight: 1,
              opacity: 1,
              color: '#1f2021', // Dark gray outline
              dashArray: '3',
              fillOpacity: 0.7,
            };
          }}
        />
      )}
    </MapContainer>
  );
};

export default Map;
