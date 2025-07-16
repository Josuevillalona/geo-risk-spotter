import React, { useState } from "react";
import Map from "../Map";
import Sidebar from "../Sidebar";
import { FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdAutoAwesome } from "react-icons/md";

const SideBySideDashboard = ({ mapProps, sidebarProps }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
            <Map {...mapProps} />
            
            {/* Risk Legend - Always Visible */}
            <div className="context-map-legend">
              <span className="legend-title">Risk Indicator</span>
              <div className="legend-items">
                {[
                  { color: "#a50f15", label: "Highest" },
                  { color: "#de2d26", label: "High" },
                  { color: "#fb6a4a", label: "Mod. High" },
                  { color: "#fcae91", label: "Moderate" },
                  { color: "#fee613", label: "Mod. Low" },
                  { color: "#a1d99b", label: "Low" },
                  { color: "#41ab5d", label: "Lowest" }
                ].map((item, idx) => (
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
            <Map {...mapProps} />
            <div className="mobile-map-legend">
              <span className="legend-title">Risk Levels</span>
              <div className="legend-items-mobile">
                {[
                  { color: "#a50f15", label: "Highest" },
                  { color: "#de2d26", label: "High" },
                  { color: "#fb6a4a", label: "Med+" },
                  { color: "#fcae91", label: "Med" },
                  { color: "#fee613", label: "Med-" },
                  { color: "#a1d99b", label: "Low" },
                  { color: "#41ab5d", label: "Lowest" }
                ].map((item, idx) => (
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
