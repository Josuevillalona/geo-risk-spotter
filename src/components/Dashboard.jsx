import React from "react";
import Map from "../Map";
import Sidebar from "../Sidebar";
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
          <div className="dashboard-legend">
            <span className="dashboard-legend-title">Risk Indicator</span>
            <div className="dashboard-legend-items">
              {[
                { color: "#a50f15", label: "Highest Risk" },
                { color: "#de2d26", label: "High Risk" },
                { color: "#fb6a4a", label: "Moderately High Risk" },
                { color: "#fcae91", label: "Moderate Risk" },
                { color: "#fee613", label: "Moderately Low Risk" },
                { color: "#a1d99b", label: "Low Risk" },
                { color: "#41ab5d", label: "Lowest Risk" }
              ].map((item, idx) => (
                <span key={idx} className="dashboard-legend-item">
                  <span className="dashboard-legend-color" style={{ background: item.color }} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="dashboard-box ai-box">
        <div className="dashboard-box-header">
          <MdAutoAwesome className="dashboard-icon" />
          <span className="dashboard-title">AI Insights</span>
        </div>
        <Sidebar {...sidebarProps} />
      </div>
    </div>
  </div>
);

export default Dashboard;
