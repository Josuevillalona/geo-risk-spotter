import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Map = () => {
  const [geojsonData, setGeojsonData] = useState(null);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/Josuevillalona/geo-risk-spotter/master/public/shapes.geojson')
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
      {geojsonData && <GeoJSON data={geojsonData} />}
    </MapContainer>
  );
};

export default Map;
