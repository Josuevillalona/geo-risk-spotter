import React, { useState } from 'react';
import RecommendationsTab from './components/RecommendationsTab';

const Sidebar = ({ selectedArea, isLoading, aiSummary }) => {
  const [activeTab, setActiveTab] = useState('ai');

  if (!selectedArea) {
    return null;
  }

  const formatPercent = (value) => {
    if (value === undefined || value === null || value === '') return '0.00%';
    const num = Number(value);
    if (isNaN(num)) return '0.00%';
    return `${num.toFixed(2)}%`;
  };

  const renderRawData = () => {
    const { properties } = selectedArea;

    return (
      <div style={{
        backgroundColor: '#f0fdf4', // Light green background
        padding: '16px',
        borderRadius: '8px',
        color: '#1f2937' // Dark gray text
      }}>
        <h3 style={{
          color: '#1f2937',
          marginBottom: '16px',
          fontWeight: '500',
          fontSize: '16px'
        }}>
          Data for Zip Code: {properties.zip_code}
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '8px',
          fontSize: '14px',
          color: '#374151'
        }}>
          <div style={{ fontWeight: '600', paddingRight: '16px' }}>Risk Score:</div>
          <div style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-block',
            fontWeight: '500'
          }}>
            {properties.RiskScore?.toFixed(2) || 'N/A'}
          </div>

          <div style={{ fontWeight: '600', paddingRight: '16px' }}>Diabetes Prevalence:</div>
          <div style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-block',
            fontWeight: '500'
          }}>
            {formatPercent(properties.DIABETES_CrudePrev)}
          </div>

          <div style={{ fontWeight: '600', paddingRight: '16px' }}>Obesity Prevalence:</div>
          <div style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-block',
            fontWeight: '500'
          }}>
            {formatPercent(properties.OBESITY_CrudePrev)}
          </div>

          <div style={{ fontWeight: '600', paddingRight: '16px' }}>Physical Activity:</div>
          <div style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-block',
            fontWeight: '500'
          }}>
            {formatPercent(properties.LPA_CrudePrev)}
          </div>

          <div style={{ fontWeight: '600', paddingRight: '16px' }}>Current Smoking:</div>
          <div style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-block',
            fontWeight: '500'
          }}>
            {formatPercent(properties.CSMOKING_CrudePrev)}
          </div>

          <div style={{ fontWeight: '600', paddingRight: '16px' }}>High Blood Pressure:</div>
          <div style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-block',
            fontWeight: '500'
          }}>
            {formatPercent(properties.BPHIGH_CrudePrev)}
          </div>

          <div style={{ fontWeight: '600', paddingRight: '16px' }}>Food Insecurity:</div>
          <div style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-block',
            fontWeight: '500'
          }}>
            {formatPercent(properties.FOODINSECU_CrudePrev)}
          </div>

          <div style={{ fontWeight: '600', paddingRight: '16px' }}>Healthcare Access:</div>
          <div style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-block',
            fontWeight: '500'
          }}>
            {formatPercent(properties.ACCESS2_CrudePrev)}
          </div>
        </div>
      </div>
    );
  };

  const renderAiSummary = () => {
    if (isLoading) {
      return <p className="ai-loading">Please wait while the AI analyzes the data.</p>;
    }

    return (      <div style={{
        backgroundColor: '#f0fdf4',
        padding: '16px',
        borderRadius: '8px',
        color: '#1f2937',
        whiteSpace: 'pre-line',
        lineHeight: '1.6',
        textAlign: 'left'
      }}>
        <div style={{
          fontSize: '14px',
          textAlign: 'left'
        }}>
          {aiSummary}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-ai-content" style={{ textAlign: 'left' }}>
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
        <button 
          className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          Recommendations
        </button>
      </div>
      <div className="ai-content-scroll" style={{ textAlign: 'left' }}>
        {activeTab === 'ai' ? (
          isLoading ? (
            <p className="ai-loading">Please wait while the AI analyzes the data.</p>
          ) : (
            <p className="ai-summary">{aiSummary}</p>
          )
        ) : activeTab === 'data' ? (
          renderRawData()
        ) : (
          <RecommendationsTab selectedArea={selectedArea} />
        )}
      </div>
    </div>
  );
};

export default Sidebar;