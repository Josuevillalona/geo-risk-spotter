import React, { useState } from "react";
import Map from "../Map";
import Sidebar from "../Sidebar";
import { FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdAutoAwesome } from "react-icons/md";

const Dashboard = ({ mapProps, sidebarProps }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-fullscreen">
      {/* Main Map Area */}      <div className="map-container">
        <Map {...mapProps} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Legend positioned at bottom of map */}
        <div className="map-legend">
          <span className="legend-title">Risk Indicator</span>
          <div className="legend-items">
            {[
              { color: "#a50f15", label: "Highest Risk" },
              { color: "#de2d26", label: "High Risk" },
              { color: "#fb6a4a", label: "Moderately High Risk" },
              { color: "#fcae91", label: "Moderate Risk" },
              { color: "#fee613", label: "Moderately Low Risk" },
              { color: "#a1d99b", label: "Low Risk" },
              { color: "#41ab5d", label: "Lowest Risk" }
            ].map((item, idx) => (
              <span key={idx} className="legend-item">
                <span className="legend-color" style={{ background: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* Sidebar Toggle Button */}
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? "Close AI Insights" : "Open AI Insights"}
        >
          <MdAutoAwesome className="sidebar-toggle-icon" />
          {sidebarOpen ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      {/* AI Insights Sidebar Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">
            <MdAutoAwesome className="sidebar-icon" />
            <span>AI Insights</span>
          </div>
          <button 
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            title="Close AI Insights"
          >
            <FaChevronRight />
          </button>
        </div>
        <div className="sidebar-content">
          <Sidebar {...sidebarProps} />
        </div>
      </div>

      {/* Backdrop */}
      {sidebarOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
