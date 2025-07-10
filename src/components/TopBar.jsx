import React, { useState } from 'react';
import axios from 'axios';
import { FaSearch, FaHeartbeat, FaSpinner } from 'react-icons/fa';
import { MdSwapHoriz, MdAutoAwesome, MdMap } from 'react-icons/md';

const TopBar = ({ setSelectedArea, setIsLoading, setAiSummary, triggerMapMove, useInsightsFirstLayout, setUseInsightsFirstLayout, showSearchResultPopup }) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async (zipCode) => {
    setSearchLoading(true);
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Primary: Try remote S3 URL first for production deployment
      // Fallback: Use local file for development
      let response;
      let dataSource = 'remote';
      
      try {
        console.log('Attempting to fetch from remote S3...');
        const fetchResponse = await fetch('https://geo-risk-spotspot-geojson.s3.us-east-1.amazonaws.com/ny_new_york_zip_codes_health.geojson');
        
        if (!fetchResponse.ok) {
          throw new Error(`HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`);
        }
        
        const data = await fetchResponse.json();
        response = { data }; // Wrap in axios-like structure
        
        console.log('✅ Remote S3 fetch successful');
      } catch (remoteError) {
        console.warn('Remote S3 fetch failed, using local file:', remoteError);
        
        // Fallback to local file
        dataSource = 'local';
        const localResponse = await axios.get('/ny_new_york_zip_codes_geo.min.json', {
          timeout: 15000, // Longer timeout for large local file
          headers: {
            'Accept': 'application/json',
          }
        });
        response = localResponse; // Keep axios structure
        console.log('✅ Local file fetch successful');
      }
      
      const data = response.data;
      console.log(`Using ${dataSource} data source. Features found:`, data.features?.length || 0);
      
      const feature = data.features?.find(f => 
        f.properties?.zip_code === zipCode || 
        f.properties?.ZIP_CODE === zipCode ||
        f.properties?.zipcode === zipCode ||
        f.properties?.ZCTA5CE10 === zipCode  // Main property used in NY zip codes data
      );
      
      if (feature) {
        console.log('🎯 Zip code found:', feature.properties);
        setSelectedArea(feature);
        triggerMapMove();
        
        // Show search popup if function is available
        if (showSearchResultPopup) {
          const zipCodeValue = feature.properties.zip_code || 
                              feature.properties.ZIP_CODE || 
                              feature.properties.zipcode || 
                              feature.properties.ZCTA5CE10;
          showSearchResultPopup(zipCodeValue, feature);
        }
        
        // Check if health data is available - be more flexible in detection
        const hasHealthData = feature.properties.RiskScore !== undefined || 
                             feature.properties.DIABETES_CrudePrev !== undefined ||
                             feature.properties.OBESITY_CrudePrev !== undefined ||
                             feature.properties.LPA_CrudePrev !== undefined ||
                             feature.properties.CSMOKING_CrudePrev !== undefined ||
                             feature.properties.BPHIGH_CrudePrev !== undefined ||
                             feature.properties.FOODINSECU_CrudePrev !== undefined ||
                             feature.properties.ACCESS2_CrudePrev !== undefined;
        
        if (!hasHealthData) {
          console.warn('⚠️ Health data not available in current data source');
          setErrorMessage('Zip code found, but health data is not available. Using basic geographic data only.');
          setAiSummary('Health analysis unavailable - basic geographic data loaded. Please ensure the complete health dataset is accessible.');
          return;
        }
        
        // Generate AI analysis with available health data
        try {
          console.log('🤖 Requesting AI analysis...');
          const zipCodeValue = feature.properties.zip_code || 
                              feature.properties.ZIP_CODE || 
                              feature.properties.zipcode || 
                              feature.properties.ZCTA5CE10;
          
          const aiResponse = await axios.post('/api/analyze', {
            zip_code: zipCodeValue,
            RiskScore: feature.properties.RiskScore,
            DIABETES_CrudePrev: feature.properties.DIABETES_CrudePrev,
            OBESITY_CrudePrev: feature.properties.OBESITY_CrudePrev,
            LPA_CrudePrev: feature.properties.LPA_CrudePrev,
            CSMOKING_CrudePrev: feature.properties.CSMOKING_CrudePrev,
            BPHIGH_CrudePrev: feature.properties.BPHIGH_CrudePrev,
            FOODINSECU_CrudePrev: feature.properties.FOODINSECU_CrudePrev,
            ACCESS2_CrudePrev: feature.properties.ACCESS2_CrudePrev,
          });
          console.log('✅ AI analysis completed');
          setAiSummary(aiResponse.data.summary);
        } catch (aiError) {
          console.error('❌ AI analysis error:', aiError);
          const errorMsg = aiError.response?.status === 500 
            ? '🤖 AI analysis temporarily unavailable. We\'re working on it! Try again in a few moments or explore another area.' 
            : '💭 Having trouble generating insights. Please check your connection and try again, or explore a different ZIP code.';
          setErrorMessage(errorMsg);
          setAiSummary('Health analysis temporarily unavailable. Try searching for another ZIP code or refresh to retry.');
        }
      } else {
        console.warn('❌ Zip code not found:', zipCode);
        setErrorMessage(`Zip code ${zipCode} not found in New York database. Please verify the zip code.`);
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      
      // Provide specific error messages based on error type
      let errorMsg = 'Failed to search zip code. Please try again.';
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMsg = 'Request timed out. Please check your connection and try again.';
      } else if (error.response?.status === 404) {
        errorMsg = 'Data source not available. Please try again later.';
      } else if (error.response?.status >= 500) {
        errorMsg = 'Server error. Please try again in a few moments.';
      }
      
      setErrorMessage(errorMsg);
      setAiSummary('Search failed. Please try again.');
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
      
      <div className="flex items-center gap-4">
        {/* Layout Toggle Button */}
        <button
          onClick={() => setUseInsightsFirstLayout(!useInsightsFirstLayout)}
          className="layout-toggle-topbar"
          title={useInsightsFirstLayout ? "Switch to Classic Layout" : "Switch to Insights-First Layout"}
        >
          <MdSwapHoriz className="layout-toggle-icon" />
          <span className="layout-toggle-text">
            {useInsightsFirstLayout ? (
              <>
                <MdMap className="inline mr-1" />
                Classic
              </>
            ) : (
              <>
                <MdAutoAwesome className="inline mr-1" />
                Insights
              </>
            )}
          </span>
        </button>
        
        <form className="search-form" onSubmit={handleSubmit}>
          <div className="search-container">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter NY ZIP code (e.g., 10001) to analyze diabetes risk"
              pattern="[0-9]{5}"
              maxLength="5"
              disabled={searchLoading}
              aria-label="Search by ZIP code for comprehensive diabetes risk analysis and health insights"
            />
            <button type="submit" disabled={searchLoading} aria-label={searchLoading ? 'Analyzing diabetes risk data, please wait...' : 'Search ZIP code for diabetes risk analysis'}>
              {searchLoading ? <FaSpinner className="icon-spin" /> : <FaSearch />}
            </button>
          </div>
          {errorMessage && <div className="search-error">{errorMessage}</div>}
        </form>
      </div>
    </div>
  );
};

export default TopBar;