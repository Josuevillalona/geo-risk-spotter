import React from "react";
import Map from "./Map";
import Sidebar from "./Sidebar";
import { FaMapMarkerAlt } from "react-icons/fa";
import { MdAutoAwesome } from "react-icons/md";

const Dashboard = ({ mapProps, sidebarProps }) => (
  <div className="dashboard-root">
    <div className="dashboard-container">
      <div className="dashboard-box map-box">
        <div className="dashboard-box-header">
          <FaMapMarkerAlt className="dashboard-icon" />
          <span className="dashboard-title">Geospatial Risk Hotspot</span>
        </div>
        <div className="dashboard-map-content">
          <Map {...mapProps} />
        </div>
        <div className="dashboard-legend">
          <span className="dashboard-legend-title">Risk Indicator</span>
          <div className="dashboard-legend-items">
            {[
              { color: "#b10026", label: "Highest Risk" },
              { color: "#e31a1c", label: "High Risk" },
              { color: "#fc4e2a", label: "Moderately High Risk" },
              { color: "#fd8d3c", label: "Moderate Risk" },
              { color: "#feb24c", label: "Moderately Low Risk" },
              { color: "#fed976", label: "Low Risk" },
              { color: "#ffffb2", label: "Lowest Risk" }
            ].map((item, idx) => (
              <span key={idx} className="dashboard-legend-item">
                <span className="dashboard-legend-color" style={{ background: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="dashboard-box ai-box">
        <div className="dashboard-box-header">
          <MdAutoAwesome className="dashboard-icon" />
          <span className="dashboard-title">AI Insights</span>
        </div>
        <div className="dashboard-ai-content">
          <Sidebar {...sidebarProps} />
        </div>
      </div>
    </div>
  </div>
);

export default Dashboard;
