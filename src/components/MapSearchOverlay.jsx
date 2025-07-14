import React, { useState } from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';

const MapSearchOverlay = ({ triggerMapMove }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      // First try S3 URL
      let response = await fetch('https://geo-risk-spotspot-geojson.s3.us-east-1.amazonaws.com/ny_new_york_zip_codes_health.geojson');
      
      if (!response.ok) {
        // Fallback to local file
        response = await fetch('/ny_new_york_zip_codes_geo.min.json');
      }

      const data = await response.json();
      
      // Search for ZIP code in the data
      const feature = data.features.find(f => 
        f.properties.ZCTA5CE10 === searchQuery.trim() ||
        f.properties.zipcode === searchQuery.trim()
      );

      if (feature) {
        // Safely call triggerMapMove if it exists
        if (triggerMapMove && typeof triggerMapMove === 'function') {
          triggerMapMove(feature);
        }
      } else {
        setError(`ZIP code ${searchQuery} not found`);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Error searching for ZIP code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="map-search-overlay">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ZIP code..."
            className="search-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={isLoading || !searchQuery.trim()}
          >
            {isLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
          </button>
        </div>
        {error && <div className="search-error">{error}</div>}
      </form>
    </div>
  );
};

export default MapSearchOverlay;