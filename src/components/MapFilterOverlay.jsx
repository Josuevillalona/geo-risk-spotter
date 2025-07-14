import React from 'react';
import { FaMapMarkerAlt, FaCity } from 'react-icons/fa';
import { useAppStore } from '../store';

const MapFilterOverlay = () => {
  const { 
    viewMode, 
    setViewMode, 
    selectedBorough, 
    setSelectedBorough,
    boroughData 
  } = useAppStore();

  const handleViewModeToggle = () => {
    setViewMode(viewMode === 'zipcode' ? 'borough' : 'zipcode');
  };

  const handleBoroughChange = (e) => {
    setSelectedBorough(e.target.value);
  };

  const boroughs = boroughData ? Object.keys(boroughData) : [];

  return (
    <div className="map-filter-overlay">
      {/* View Mode Toggle */}
      <div className="filter-section">
        <button
          onClick={handleViewModeToggle}
          className="view-mode-toggle"
          title={`Switch to ${viewMode === 'zipcode' ? 'Borough' : 'ZIP Code'} view`}
        >
          {viewMode === 'zipcode' ? (
            <>
              <FaCity className="icon" />
              <span>Borough View</span>
            </>
          ) : (
            <>
              <FaMapMarkerAlt className="icon" />
              <span>ZIP Code View</span>
            </>
          )}
        </button>
      </div>

      {/* Borough Filter */}
      <div className="filter-section">
        <select
          value={selectedBorough}
          onChange={handleBoroughChange}
          className="borough-select"
          title="Filter by borough"
        >
          <option value="All">All Boroughs</option>
          {boroughs.map(borough => (
            <option key={borough} value={borough}>
              {borough}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MapFilterOverlay;