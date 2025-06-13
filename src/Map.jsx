import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Map = ({ setSelectedArea }) => {
  const [geojsonData, setGeojsonData] = useState(null);

  useEffect(() => {
    fetch('https://geo-risk-spotspot-geojson.s3.us-east-1.amazonaws.com/ny_new_york_zip_codes_health.geojson')
      .then(response => response.json())
      .then(data => {
        console.log("Fetched GeoJSON Data:", data); // Add this line for debugging
        setGeojsonData(data);
      })
      .catch(error => console.error('Error loading GeoJSON data:', error));
  }, []);

  // Function to determine color based on RiskScore (Green-Yellow-Red scale)
  const getRiskScoreColor = (score) => {
    return score > 25.0 ? '#a50f15' : // Darkest Red (Highest Risk)
           score > 20.01 ? '#de2d26' : // Red (High Risk - above 75th percentile)
           score > 18.48 ? '#fb6a4a' : // Orange-Red (Moderately High Risk - above median)
           score > 16.34 ? '#fcae91' : // Light Orange (Moderate Risk - above 25th percentile)
           score > 10.0 ? '#fee613' : // Yellow (Moderately Low Risk)
           score > 5.0 ? '#a1d99b' : // Light Green (Low Risk)
                         '#41ab5d'; // Darker Green (Lowest Risk - approaching min)
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
          onEachFeature={(feature, layer) => {
            layer.on({
              click: (event) => {
                console.log("Clicked Feature Properties:", feature.properties); // Keep for debugging for now
                // Find the full feature object in the original geojsonData based on zip_code
                const clickedZipCode = feature.properties.zip_code;
                const fullFeatureData = geojsonData.features.find(
                  (item) => item.properties.zip_code === clickedZipCode
                );

                if (fullFeatureData) {
                  // Use the properties from the full feature data to set the selected area
                  setSelectedArea(fullFeatureData);
                } else {
                  console.error("Full feature data not found for zip code:", clickedZipCode);
                  setSelectedArea(null); // Clear sidebar if data not found
                }
              },
            });
          }}
        />
      )}
    </MapContainer>
  );
};

export default Map;
