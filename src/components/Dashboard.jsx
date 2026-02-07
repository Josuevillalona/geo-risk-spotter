import React, { useState } from "react";
import Map from "../Map";
import Sidebar from "../Sidebar";
import { FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdAutoAwesome } from "react-icons/md";
import { useAppStore } from '../store';

const Dashboard = ({ mapProps, sidebarProps }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { visualizationMode, clusterProfiles } = useAppStore();

  const riskLegendItems = [
    { color: "#a50f15", label: "Highest Risk" },
    { color: "#de2d26", label: "High Risk" },
    { color: "#fb6a4a", label: "Moderately High Risk" },
    { color: "#fcae91", label: "Moderate Risk" },
    { color: "#fee613", label: "Moderately Low Risk" },
    { color: "#a1d99b", label: "Low Risk" },
    { color: "#41ab5d", label: "Lowest Risk" }
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

  return (
    <div className="dashboard-fullscreen">
      {/* Main Map Area */}      <div className="map-container">
        <Map {...mapProps} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Legend positioned at bottom of map */}
        <div className="map-legend">
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
