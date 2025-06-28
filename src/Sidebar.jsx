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
          marginBottom: '20px',
          fontWeight: '600',
          fontSize: '18px',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '8px'
        }}>
          Data for Zip Code {properties.zip_code}
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          fontSize: '14px'
        }}>
          {/* Risk Score - Special styling for primary metric */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px'
          }}>
            <span style={{ fontWeight: '600', color: '#92400e' }}>Risk Score:</span>
            <span style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '20px',
              fontWeight: '600',
              fontSize: '16px'
            }}>
              {properties.RiskScore?.toFixed(2) || 'N/A'}
            </span>
          </div>

          {/* Health Metrics */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 12px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px'
          }}>
            <span style={{ fontWeight: '600', color: '#1e40af' }}>Diabetes Prevalence:</span>
            <span style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '3px 10px',
              borderRadius: '15px',
              fontWeight: '500',
              minWidth: '60px',
              textAlign: 'center'
            }}>
              {formatPercent(properties.DIABETES_CrudePrev)}
            </span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 12px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px'
          }}>
            <span style={{ fontWeight: '600', color: '#1e40af' }}>Obesity Prevalence:</span>
            <span style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '3px 10px',
              borderRadius: '15px',
              fontWeight: '500',
              minWidth: '60px',
              textAlign: 'center'
            }}>
              {formatPercent(properties.OBESITY_CrudePrev)}
            </span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 12px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px'
          }}>
            <span style={{ fontWeight: '600', color: '#1e40af' }}>Physical Activity:</span>
            <span style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '3px 10px',
              borderRadius: '15px',
              fontWeight: '500',
              minWidth: '60px',
              textAlign: 'center'
            }}>
              {formatPercent(properties.LPA_CrudePrev)}
            </span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 12px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px'
          }}>
            <span style={{ fontWeight: '600', color: '#1e40af' }}>Current Smoking:</span>
            <span style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '3px 10px',
              borderRadius: '15px',
              fontWeight: '500',
              minWidth: '60px',
              textAlign: 'center'
            }}>
              {formatPercent(properties.CSMOKING_CrudePrev)}
            </span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 12px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px'
          }}>
            <span style={{ fontWeight: '600', color: '#1e40af' }}>High Blood Pressure:</span>
            <span style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '3px 10px',
              borderRadius: '15px',
              fontWeight: '500',
              minWidth: '60px',
              textAlign: 'center'
            }}>
              {formatPercent(properties.BPHIGH_CrudePrev)}
            </span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 12px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px'
          }}>
            <span style={{ fontWeight: '600', color: '#1e40af' }}>Food Insecurity:</span>
            <span style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '3px 10px',
              borderRadius: '15px',
              fontWeight: '500',
              minWidth: '60px',
              textAlign: 'center'
            }}>
              {formatPercent(properties.FOODINSECU_CrudePrev)}
            </span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 12px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px'
          }}>
            <span style={{ fontWeight: '600', color: '#1e40af' }}>Healthcare Access:</span>
            <span style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '3px 10px',
              borderRadius: '15px',
              fontWeight: '500',
              minWidth: '60px',
              textAlign: 'center'
            }}>
              {formatPercent(properties.ACCESS2_CrudePrev)}
            </span>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="sidebar-wrapper">
      {/* Save Analysis Button */}
      <div className="save-section">
        <button
          onClick={handleSave}
          disabled={!selectedArea || isLoading}
          className={`save-button ${
            saveStatus === 'success' ? 'save-success' : 
            saveStatus === 'error' ? 'save-error' : 
            saveStatus === 'deleted' ? 'save-deleted' : ''
          }`}
          title={!aiSummary ? 'AI analysis required to save' : 'Save current analysis'}
        >
          {saveStatus === 'success' ? '✓ Saved!' : 
           saveStatus === 'error' ? '✗ Error' : 
           saveStatus === 'deleted' ? '✓ Deleted' : 
           'Save Analysis'}
        </button>
      </div>
      
      {/* Tabs */}
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
      
      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'ai' ? (
          isLoading ? (
            <p className="ai-loading">Please wait while the AI analyzes the data.</p>
          ) : (
            <div className="ai-summary-container">
              <div className="ai-summary">
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