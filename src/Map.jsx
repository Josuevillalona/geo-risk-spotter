import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import DataPopover from './DataPopover'; // Import the new component

const Map = ({ setSelectedArea, setIsLoading, setAiSummary }) => {
  const [geojsonData, setGeojsonData] = useState(null);
  const [popoverData, setPopoverData] = useState(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [popoverPinned, setPopoverPinned] = useState(false);

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

  const onEachFeature = (feature, layer) => {
    layer.bindPopup(() => {
      const props = feature.properties;
      return `
        <div>
          <strong>Zip Code: ${props.zip_code}</strong>
        </div>
      `;
    });
    layer.on({
      mouseover: (event) => {
        // Removed hover logic to prevent raw data display on hover
      },
      mouseout: (event) => {
        // Removed hover logic to prevent raw data display on hover
      },
      click: (event) => {
        console.log("Clicked Feature Properties:", feature.properties); // Keep for debugging for now
        // Find the full feature object in the original geojsonData based on zip_code
        const clickedZipCode = feature.properties.zip_code;
        const fullFeatureData = geojsonData.features.find(
          (item) => item.properties.zip_code === clickedZipCode
        );

        if (popoverPinned && popoverData && popoverData.properties.zip_code === clickedZipCode) {
          // If the same pinned popover is clicked, unpin and hide it
          setPopoverPinned(false);
          setPopoverVisible(false);
          setPopoverData(null); // Clear popover data
        } else if (fullFeatureData) {
          // Otherwise, set/update the popover data and pin it
          setPopoverPinned(true);
          setPopoverData(fullFeatureData);
          setPopoverPosition({ x: event.originalEvent.clientX, y: event.originalEvent.clientY });
          setPopoverVisible(true);

          // Use the properties from the full feature data to set the selected area
          setSelectedArea(fullFeatureData);

          // Call the backend API for analysis
          setIsLoading(true);
          setAiSummary(null); // Clear previous summary
          axios.post('https://geo-risk-spotter.onrender.com/api/analyze', {
            zip_code: fullFeatureData.properties.zip_code,
            RiskScore: fullFeatureData.properties.RiskScore,
            DIABETES_CrudePrev: fullFeatureData.properties.DIABETES_CrudePrev,
            OBESITY_CrudePrev: fullFeatureData.properties.OBESITY_CrudePrev,
            LPA_CrudePrev: fullFeatureData.properties.LPA_CrudePrev,
            CSMOKING_CrudePrev: fullFeatureData.properties.CSMOKING_CrudePrev,
            BPHIGH_CrudePrev: fullFeatureData.properties.BPHIGH_CrudePrev,
            FOODINSECU_CrudePrev: fullFeatureData.properties.FOODINSECU_CrudePrev,
            ACCESS2_CrudePrev: fullFeatureData.properties.ACCESS2_CrudePrev,
            // Include other raw data properties as needed
          })
          .then(response => {
            console.log("Backend API Response:", response.data);
            setAiSummary(response.data.summary);
            setIsLoading(false);
          })
          .catch(error => {
            console.error("Error calling backend API:", error);
            setAiSummary(null); // Clear summary on error
            setIsLoading(false);
          });

        } else {
          console.error("Full feature data not found for zip code:", clickedZipCode);
          setSelectedArea(null); // Clear sidebar if data not found
        }
      },
    });
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
          onEachFeature={onEachFeature}
        />
      )}
      {/* Render the DataPopover */}
      <DataPopover
        data={popoverData}
        position={popoverPosition}
        visible={popoverVisible}
        onClose={() => {
          setPopoverVisible(false);
          setPopoverPinned(false);
        }}
      />
    </MapContainer>
  );
};

export default Map;
