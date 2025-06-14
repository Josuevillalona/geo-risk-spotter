import React, { useState } from 'react';

const Sidebar = ({ selectedArea, isLoading, aiSummary }) => {
  const [activeTab, setActiveTab] = useState('ai');

  if (!selectedArea) {
    return null;
  }

  const renderRawData = () => {
    const { properties } = selectedArea;
    return (
      <div className="raw-data-content">
        <h3>Data for Zip Code: {properties.zip_code}</h3>
        <ul className="metrics-list">
          <li>Risk Score: {properties.RiskScore.toFixed(2)}</li>
          <li>Diabetes Prevalence: {properties.DIABETES_CrudePrev}%</li>
          <li>Obesity Prevalence: {properties.OBESITY_CrudePrev}%</li>
          <li>Physical Activity: {properties.PHYSACT_CrudePrev}%</li>
          <li>Current Smoking: {properties.CSMOKING_CrudePrev}%</li>
          <li>High Blood Pressure: {properties.BPHIGH_CrudePrev}%</li>
          <li>Food Insecurity: {properties.FOODINSECU_CrudePrev}%</li>
          <li>Healthcare Access: {properties.HEALTHCARE_CrudePrev}%</li>
        </ul>
      </div>
    );
  };

  return (
    <div className="dashboard-ai-content">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          AI Analysis
        </button>
        <button 
          className={`tab ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          Raw Data
        </button>
      </div>
      <div className="ai-content-scroll">
        {activeTab === 'ai' ? (
          isLoading ? (
            <p className="ai-loading">Please wait while the AI analyzes the data.</p>
          ) : (
            <p className="ai-summary">{aiSummary}</p>
          )
        ) : (
          renderRawData()
        )}
      </div>
    </div>
  );
};

export default Sidebar;
