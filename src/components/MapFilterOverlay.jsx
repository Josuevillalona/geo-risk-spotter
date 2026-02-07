import { FaMapMarkerAlt, FaCity, FaHeartbeat, FaLayerGroup } from 'react-icons/fa';
import { useAppStore } from '../store';

const MapFilterOverlay = () => {
  const {
    viewMode,
    setViewMode,
    selectedBorough,
    setSelectedBorough,
    boroughData,
    visualizationMode,
    setVisualizationMode,
    isClusterDataLoading,
    clusterData
  } = useAppStore();

  const handleViewModeToggle = () => {
    setViewMode(viewMode === 'zipcode' ? 'borough' : 'zipcode');
  };

  const handleBoroughChange = (e) => {
    setSelectedBorough(e.target.value);
  };

  const boroughs = boroughData ? Object.keys(boroughData) : [];

  // Determine effective mode for UI (shows loading state appropriately)
  const isClusterActive = visualizationMode === 'cluster';
  const isClusterReady = clusterData && !isClusterDataLoading;

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

      {/* Visualization Mode Toggle (Only in Zip Code View) */}
      {viewMode === 'zipcode' && (
        <div className="filter-section">
          <div className={`segmented-control ${isClusterDataLoading ? 'loading' : ''}`}>
            {/* Sliding indicator */}
            <div
              className={`segment-indicator ${isClusterActive ? 'right' : 'left'}`}
              style={{
                background: isClusterActive
                  ? (isClusterDataLoading ? '#94a3b8' : '#3b82f6')
                  : '#10b981'
              }}
            />

            <button
              className={`segment-btn ${!isClusterActive ? 'active' : ''}`}
              onClick={() => setVisualizationMode('risk')}
              title="Color by health risk score (green to red)"
            >
              <FaHeartbeat className="segment-icon" />
              <span>Risk Score</span>
            </button>

            <button
              className={`segment-btn ${isClusterActive ? 'active' : ''} ${isClusterDataLoading ? 'loading' : ''}`}
              onClick={() => setVisualizationMode('cluster')}
              title="Group areas by similar health profiles"
            >
              {isClusterDataLoading ? (
                <>
                  <div className="loading-dots">
                    <span></span><span></span><span></span>
                  </div>
                  <span>Loading</span>
                </>
              ) : (
                <>
                  <FaLayerGroup className="segment-icon" />
                  <span>Clusters</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

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