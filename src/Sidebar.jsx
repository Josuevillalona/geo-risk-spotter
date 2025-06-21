import React, { useState } from 'react';
import RecommendationsTab from './components/RecommendationsTab';
import { useAppStore } from './store';

const Sidebar = ({ selectedArea, isLoading, aiSummary }) => {
  const [activeTab, setActiveTab] = useState('ai');
  const [saveStatus, setSaveStatus] = useState(null);  const saveCurrentAnalysis = useAppStore((state) => state.saveCurrentAnalysis);
  const savedAnalyses = useAppStore((state) => state.savedAnalyses);
  const deleteSavedAnalysis = useAppStore((state) => state.deleteSavedAnalysis);

  if (!selectedArea) {
    return null;
  }

  const handleSave = () => {
    try {
      saveCurrentAnalysis({
        selectedArea,
        aiSummary,
        chatHistory: [] // Default empty for now
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);    }
  };

  const handleDelete = (analysisToDelete) => {
    try {
      deleteSavedAnalysis(analysisToDelete);
      setSaveStatus('deleted');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const formatPercent = (value) => {
    if (value === undefined || value === null || value === '') return '0.00%';
    const num = Number(value);
    if (isNaN(num)) return '0.00%';
    return `${num.toFixed(2)}%`;
  };

  const renderSavedAnalyses = () => {
    if (savedAnalyses.length === 0) {
      return (
        <div style={{
          backgroundColor: '#f0fdf4',
          padding: '16px',
          borderRadius: '8px',
          color: '#1f2937',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            No saved analyses yet. Select an area and click "Save Analysis" to get started.
          </p>
        </div>
      );
    }

    return (
      <div style={{
        backgroundColor: '#f0fdf4',
        padding: '16px',
        borderRadius: '8px',
        color: '#1f2937'
      }}>
        <h3 style={{
          color: '#1f2937',
          marginBottom: '16px',
          fontWeight: '500',
          fontSize: '16px'
        }}>
          Saved Analyses ({savedAnalyses.length})
        </h3>
        
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {savedAnalyses.slice().reverse().map((analysis, index) => (
            <div key={`${analysis.zcta_code}-${analysis.saved_at}`} style={{
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '8px',
              backgroundColor: 'white'
            }}>              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>
                  Zip Code: {analysis.zcta_code}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {new Date(analysis.saved_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDelete(analysis)}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                    title="Delete this analysis"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              {analysis.aiSummary && (
                <div style={{
                  fontSize: '12px',
                  color: '#374151',
                  backgroundColor: '#f9fafb',
                  padding: '8px',
                  borderRadius: '4px',
                  marginTop: '8px',
                  maxHeight: '60px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {analysis.aiSummary.substring(0, 150)}
                  {analysis.aiSummary.length > 150 ? '...' : ''}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRawData = () => {
    const { properties } = selectedArea;

    return (
      <div style={{
        backgroundColor: '#f0fdf4',
        padding: '16px',
        borderRadius: '8px',
        color: '#1f2937'
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

  return (
    <div className="dashboard-ai-content" style={{ textAlign: 'left' }}>
      {/* Save Analysis Button */}
      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={handleSave}
          disabled={!selectedArea || isLoading}
          style={{
            backgroundColor: (!selectedArea || isLoading) ? '#cccccc' : '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: (!selectedArea || isLoading) ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          Save Analysis
        </button>        {saveStatus === 'success' && (
          <span style={{ color: '#16a34a', fontSize: '12px' }}>Analysis saved!</span>
        )}
        {saveStatus === 'deleted' && (
          <span style={{ color: '#f59e0b', fontSize: '12px' }}>Analysis deleted!</span>
        )}
        {saveStatus === 'error' && (
          <span style={{ color: '#dc2626', fontSize: '12px' }}>Operation failed</span>
        )}
      </div>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          AI Summary
        </button>
        <button
          className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          AI Chat Bot
        </button>
        <button 
          className={`tab ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          Raw Data
        </button>
        <button 
          className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved
        </button>
      </div>
      <div className="ai-content-scroll" style={{ textAlign: 'left' }}>
        {activeTab === 'ai' ? (
          isLoading ? (
            <p className="ai-loading">Please wait while the AI analyzes the data.</p>
          ) : (
            <div style={{
              backgroundColor: '#f0fdf4',
              padding: '16px',
              borderRadius: '8px',
              color: '#1f2937',
              whiteSpace: 'pre-line',
              lineHeight: '1.6'
            }}>
              <div style={{
                fontSize: '14px'
              }}>
                {aiSummary}
              </div>
            </div>
          )
        ) : activeTab === 'data' ? (
          renderRawData()
        ) : activeTab === 'saved' ? (
          renderSavedAnalyses()
        ) : (
          <RecommendationsTab selectedArea={selectedArea} />
        )}
      </div>
    </div>
  );
};

export default Sidebar;