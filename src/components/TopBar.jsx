import React, { useState } from 'react';
import axios from 'axios';
import { FaSearch, FaHeartbeat, FaSpinner } from 'react-icons/fa';

const TopBar = ({ setSelectedArea, setIsLoading, setAiSummary, triggerMapMove }) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async (zipCode) => {
    setSearchLoading(true);
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch('https://geo-risk-spotspot-geojson.s3.us-east-1.amazonaws.com/ny_new_york_zip_codes_health.geojson');
      const data = await response.json();
      const feature = data.features.find(f => f.properties.zip_code === zipCode);
      if (feature) {
        setSelectedArea(feature);
        triggerMapMove();
        try {
          const aiResponse = await axios.post('/api/analyze', {
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
          setAiSummary(aiResponse.data.summary);
        } catch (aiError) {
          console.error('AI analysis error:', aiError);
          setErrorMessage('Unable to generate analysis. Please try again.');
          setAiSummary('Failed to generate AI analysis');
        }
      } else {
        setErrorMessage('Zip code not found in New York database');
      }
    } catch (error) {
      console.error('Error during search:', error);
      setErrorMessage('Failed to search zip code. Please try again.');
      setAiSummary('Failed to generate AI analysis');
    } finally {
      setSearchLoading(false);
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (searchInput.match(/^\d{5}$/)) {
      handleSearch(searchInput);
    } else {
      setErrorMessage('Please enter a valid 5-digit zip code');
    }
  };

  return (
    <div className="top-bar flex flex-col sm:flex-row sm:items-center sm:justify-between bg-green-700 text-white p-4 shadow-md">
      <div className="flex flex-col items-start sm:flex-row sm:items-center">
        <div className="logo flex items-center gap-2 font-bold text-xl">
          <FaHeartbeat className="logo-icon text-2xl text-pink-200" aria-hidden="true" />
          <span>RiskPulse: Diabetes</span>
        </div>
        <span className="ml-2 text-sm text-white/90 hidden sm:inline">
          AI-powered diabetes risk mapping for public health
        </span>
      </div>
      <form className="search-form mt-4 sm:mt-0" onSubmit={handleSubmit}>
        <div className="search-container">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter zip code..."
            pattern="[0-9]{5}"
            maxLength="5"
            disabled={searchLoading}
            aria-label="Search by zip code"
          />
          <button type="submit" disabled={searchLoading} aria-label={searchLoading ? 'Searching...' : 'Search'}>
            {searchLoading ? <FaSpinner className="icon-spin" /> : <FaSearch />}
          </button>
        </div>
        {errorMessage && <div className="search-error">{errorMessage}</div>}
      </form>
    </div>
  );
};

export default TopBar;