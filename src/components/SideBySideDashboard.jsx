import React, { useState } from "react";
import Map from "../Map";
import Sidebar from "../Sidebar";
import { FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdAutoAwesome } from "react-icons/md";
import { useAppStore } from '../store';

const SideBySideDashboard = ({ mapProps, sidebarProps }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { visualizationMode, clusterProfiles } = useAppStore();

  const riskLegendItems = [
    { color: "#a50f15", label: "Highest" },
    { color: "#de2d26", label: "High" },
    { color: "#fb6a4a", label: "Mod. High" },
    { color: "#fcae91", label: "Moderate" },
    { color: "#fee613", label: "Mod. Low" },
    { color: "#a1d99b", label: "Low" },
    { color: "#41ab5d", label: "Lowest" }
  ];

  const clusterLegendItems = clusterProfiles ? clusterProfiles.map((profile) => ({
    color: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'][profile.cluster_id] || '#cccccc',
    label: profile.name || `Group ${String.fromCharCode(65 + profile.cluster_id)}`
  })) : [
    { color: '#1f77b4', label: "Loading..." },
    { color: '#ff7f0e', label: "Loading..." },
    { color: '#2ca02c', label: "Loading..." },
    { color: '#d62728', label: "Loading..." },
    { color: '#9467bd', label: "Loading..." }
  ];

  const currentLegendItems = visualizationMode === 'cluster' ? clusterLegendItems : riskLegendItems;
  const legendTitle = visualizationMode === 'cluster' ? "Health Profiles" : "Risk Indicator";

  // For mobile responsiveness
  const [mobileActivePanel, setMobileActivePanel] = useState('insights'); // 'insights' or 'map'

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="dashboard-side-by-side">
      {/* Main Content Container */}
      <div className={`main-content-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>

        {/* AI Insights Panel - Primary */}
        <div className={`ai-insights-panel ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="insights-panel-header">
            <div className="panel-title">
              <MdAutoAwesome className="panel-icon" />
              <span>AI Insights Hub</span>
            </div>
            <button
              className="panel-collapse-btn"
              onClick={toggleSidebarCollapse}
              title={sidebarCollapsed ? "Expand AI Insights" : "Collapse AI Insights"}
            >
              {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          </div>

          <div className="insights-panel-content">
            {!sidebarCollapsed && (
              <Sidebar {...sidebarProps} />
            )}
          </div>
        </div>

        {/* Map Context Panel - Secondary */}
        <div className="map-context-panel">
          <div className="map-panel-header">
            <div className="panel-title">
              <FaMapMarkerAlt className="panel-icon" />
              <span>Geographic Context</span>
            </div>
          </div>

          <div className="map-panel-content">
            <Map {...mapProps} sidebarCollapsed={sidebarCollapsed} />

            <div className="context-map-legend">
              <span className="legend-title">{legendTitle}</span>
              <div className="legend-items">
                {currentLegendItems.map((item, idx) => (
                  <span key={idx} className="legend-item">
                    <span className="legend-color" style={{ background: item.color }} />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Panel Navigation */}
      <div className="mobile-panel-nav">
        <button
          className={`mobile-nav-btn ${mobileActivePanel === 'insights' ? 'active' : ''}`}
          onClick={() => setMobileActivePanel('insights')}
        >
          <MdAutoAwesome />
          <span>Insights</span>
        </button>
        <button
          className={`mobile-nav-btn ${mobileActivePanel === 'map' ? 'active' : ''}`}
          onClick={() => setMobileActivePanel('map')}
        >
          <FaMapMarkerAlt />
          <span>Map</span>
        </button>
      </div>

      {/* Mobile Content Display */}
      <div className="mobile-content">
        {mobileActivePanel === 'insights' ? (
          <div className="mobile-insights-panel">
            <Sidebar {...sidebarProps} />
          </div>
        ) : (
          <div className="mobile-map-panel">
            <Map {...mapProps} sidebarCollapsed={sidebarCollapsed} />
            <div className="mobile-map-legend">
              <span className="legend-title">{legendTitle}</span>
              <div className="legend-items-mobile">
                {currentLegendItems.map((item, idx) => (
                  <span key={idx} className="legend-item-mobile">
                    <span className="legend-color-mobile" style={{ background: item.color }} />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SideBySideDashboard;
