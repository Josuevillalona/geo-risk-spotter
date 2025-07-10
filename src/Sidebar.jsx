import React, { useState, useMemo } from 'react';
import RecommendationsTab from './components/RecommendationsTab';
import EnhancedInterventionDisplay from './components/EnhancedInterventionDisplay';
import SaveAnalysisButton from './components/sidebar/SaveAnalysisButton';
import SavedAnalysesList from './components/sidebar/SavedAnalysesList';
import { useAppStore } from './store';
import { MdAnalytics, MdChat, MdBookmark, MdBarChart, MdTrendingUp } from 'react-icons/md';

const Sidebar = ({ selectedArea, isLoading, aiSummary }) => {
  const [activeSection, setActiveSection] = useState('analysis');
  const [enhancedLoading, setEnhancedLoading] = useState(false);
  const [showEnhancedRAG, setShowEnhancedRAG] = useState(false);

  const formatPercent = (value) => {
    if (value === undefined || value === null || value === '') return '0.00%';
    const num = Number(value);
    if (isNaN(num)) return '0.00%';
    return `${num.toFixed(2)}%`;
  };

  // Memoize key metrics for performance - ALWAYS call this hook
  const keyMetrics = useMemo(() => {
    if (!selectedArea?.properties) return null;
    
    const { properties } = selectedArea;
    return {
      riskScore: properties.RiskScore?.toFixed(2) || 'N/A',
      diabetes: formatPercent(properties.DIABETES_CrudePrev),
      obesity: formatPercent(properties.OBESITY_CrudePrev),
      hypertension: formatPercent(properties.BPHIGH_CrudePrev),
      physicalActivity: formatPercent(properties.LPA_CrudePrev),
      smoking: formatPercent(properties.CSMOKING_CrudePrev),
      foodInsecurity: formatPercent(properties.FOODINSECU_CrudePrev),
      healthcareAccess: formatPercent(properties.ACCESS2_CrudePrev)
    };
  }, [selectedArea?.properties]);

  // Early return AFTER all hooks are declared
  if (!selectedArea) {
    return (
      <div className="sidebar-empty-state">
        <div className="empty-state-content">
          <MdAnalytics className="empty-state-icon" />
          <h3>Discover Diabetes Risk Insights</h3>
          <p>Search for any New York ZIP code above or click a neighborhood on the map to unlock comprehensive diabetes risk analysis</p>
          <div className="empty-state-features">
            <small>✨ AI-powered health analysis</small>
            <small>📊 8 key health metrics</small>
            <small>🎯 Evidence-based interventions</small>
          </div>
        </div>
      </div>
    );
  }

  const renderAnalysisSection = () => (
    <div className="section-content">
      {/* AI Summary */}
      <div className="analysis-summary">
        <div className="section-header">
          <MdTrendingUp className="section-icon" />
          <h3>AI Analysis</h3>
        </div>
        {isLoading ? (
          <div className="ai-loading-state">
            <div className="loading-spinner"></div>
            <span>🧠 Analyzing diabetes risk patterns...</span>
            <small style={{ display: 'block', marginTop: '4px', opacity: 0.7 }}>
              Processing 8 health indicators with AI insights
            </small>
          </div>
        ) : (
          <div className="ai-summary-container">
            <div className="ai-summary">
              {aiSummary}
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics Grid */}
      <div className="health-metrics-grid">
        <div className="section-header">
          <MdBarChart className="section-icon" />
          <h3>Key Health Metrics</h3>
        </div>
        {isLoading ? (
          <div className="metrics-loading">
            <div className="metric-skeleton"></div>
            <div className="metric-skeleton"></div>
            <div className="metric-skeleton"></div>
            <div className="metric-skeleton"></div>
            <div className="metric-skeleton"></div>
            <div className="metric-skeleton"></div>
            <div className="metric-skeleton"></div>
            <div className="metric-skeleton"></div>
          </div>
        ) : (
          <div className="metrics-quick-view">
            <div className="metric-card primary" title="Overall diabetes risk score (0-10 scale) - Higher scores indicate greater risk">
              <span className="metric-label">Risk Score</span>
              <span className="metric-value">
                {keyMetrics?.riskScore || 'N/A'}
              </span>
            </div>
            <div className="metric-card" title="Percentage of adults aged 20+ diagnosed with diabetes">
              <span className="metric-label">Diabetes</span>
              <span className="metric-value">
                {keyMetrics?.diabetes || 'N/A'}
              </span>
            </div>
            <div className="metric-card" title="Percentage of adults with Body Mass Index (BMI) ≥30">
              <span className="metric-label">Obesity</span>
              <span className="metric-value">
                {keyMetrics?.obesity || 'N/A'}
              </span>
            </div>
            <div className="metric-card" title="Percentage of adults with high blood pressure or hypertension">
              <span className="metric-label">Hypertension</span>
              <span className="metric-value">
                {keyMetrics?.hypertension || 'N/A'}
              </span>
            </div>
            <div className="metric-card" title="Percentage of adults with no leisure-time physical activity">
              <span className="metric-label">Physical Inactivity</span>
              <span className="metric-value">
                {keyMetrics?.physicalActivity || 'N/A'}
              </span>
            </div>
            <div className="metric-card" title="Percentage of adults who currently smoke cigarettes">
              <span className="metric-label">Current Smoking</span>
              <span className="metric-value">
                {keyMetrics?.smoking || 'N/A'}
              </span>
            </div>
            <div className="metric-card" title="Percentage of households experiencing limited access to adequate food">
              <span className="metric-label">Food Insecurity</span>
              <span className="metric-value">
                {keyMetrics?.foodInsecurity || 'N/A'}
              </span>
            </div>
            <div className="metric-card" title="Percentage of adults with limited access to healthcare services">
              <span className="metric-label">Healthcare Access</span>
              <span className="metric-value">
                {keyMetrics?.healthcareAccess || 'N/A'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderRecommendationsSection = () => (
    <div className="section-content">
      {/* Enhanced RAG Toggle */}
      <div className="enhanced-rag-toggle">
        <div className="toggle-header">
          <span className="toggle-label">Enhanced RAG Analysis</span>
          <button 
            className={`toggle-btn ${showEnhancedRAG ? 'active' : ''}`}
            onClick={() => setShowEnhancedRAG(!showEnhancedRAG)}
          >
            <span className="toggle-slider"></span>
          </button>
        </div>
        <p className="toggle-description">
          Get advanced AI-powered recommendations with detailed scoring
        </p>
      </div>

      {/* Enhanced RAG or Regular Chat */}
      {showEnhancedRAG ? (
        <div className="enhanced-rag-container">
          <div className="enhanced-rag-info">
            <div className="info-header">
              <span className="rocket-icon">🚀</span>
              <span className="info-title">Phase B: Enhanced RAG Intelligence</span>
            </div>
            <p className="info-description">
              Advanced AI-powered recommendations using vector similarity, health keyword analysis, 
              and implementation context scoring. Get transparent, evidence-based intervention 
              suggestions with detailed scoring breakdowns.
            </p>
          </div>
          <EnhancedInterventionDisplay 
            selectedArea={selectedArea} 
            isLoading={enhancedLoading}
            setIsLoading={setEnhancedLoading}
          />
        </div>
      ) : (
        <div className="chatbot-container">
          <div className="section-header">
            <MdChat className="section-icon" />
            <h3>AI Assistant</h3>
          </div>
          <RecommendationsTab selectedArea={selectedArea} />
        </div>
      )}
    </div>
  );

  const renderSavedSection = () => (
    <div className="section-content">
      <div className="section-header">
        <MdBookmark className="section-icon" />
        <h3>Analysis History</h3>
      </div>
      <SavedAnalysesList />
    </div>
  );

  return (
    <div className="sidebar-wrapper">
      {/* Save Analysis Button */}
      <SaveAnalysisButton 
        selectedArea={selectedArea}
        aiSummary={aiSummary}
        isLoading={isLoading}
      />
      
      {/* Section Navigation */}
      <div className="section-navigation" role="tablist">
        <button 
          className={`section-nav-btn ${activeSection === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveSection('analysis')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveSection('analysis');
            }
          }}
          role="tab"
          aria-selected={activeSection === 'analysis'}
          aria-controls="analysis-panel"
        >
          <MdAnalytics className="nav-icon" />
          <span>Analysis</span>
        </button>
        <button
          className={`section-nav-btn ${activeSection === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveSection('recommendations')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveSection('recommendations');
            }
          }}
          role="tab"
          aria-selected={activeSection === 'recommendations'}
          aria-controls="recommendations-panel"
        >
          <MdChat className="nav-icon" />
          <span>Recommendations</span>
        </button>
        <button 
          className={`section-nav-btn ${activeSection === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveSection('saved')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveSection('saved');
            }
          }}
          role="tab"
          aria-selected={activeSection === 'saved'}
          aria-controls="saved-panel"
        >
          <MdBookmark className="nav-icon" />
          <span>Saved</span>
        </button>
      </div>
      
      {/* Section Content */}
      <div className="section-container">
        {activeSection === 'analysis' && (
          <div role="tabpanel" id="analysis-panel" aria-labelledby="analysis-tab">
            {renderAnalysisSection()}
          </div>
        )}
        {activeSection === 'recommendations' && (
          <div role="tabpanel" id="recommendations-panel" aria-labelledby="recommendations-tab">
            {renderRecommendationsSection()}
          </div>
        )}
        {activeSection === 'saved' && (
          <div role="tabpanel" id="saved-panel" aria-labelledby="saved-tab">
            {renderSavedSection()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;