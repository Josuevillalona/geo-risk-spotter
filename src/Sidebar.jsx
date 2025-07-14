import React, { useState, useMemo } from 'react';
import RecommendationsTab from './components/RecommendationsTab';
import EnhancedInterventionDisplay from './components/EnhancedInterventionDisplay';
import SaveAnalysisButton from './components/sidebar/SaveAnalysisButton';
import SavedAnalysesList from './components/sidebar/SavedAnalysesList';
import HeroMetrics from './components/sidebar/HeroMetrics';
import ContextStrip from './components/sidebar/ContextStrip';
import RootCausePanel from './components/sidebar/RootCausePanel';
import NeighborhoodComparison from './components/sidebar/NeighborhoodComparison';
import EvidenceBuilder from './components/evidence/EvidenceBuilder';
import PresentationMode from './components/presentation/PresentationMode';
import { useAppStore } from './store';
import { MdAnalytics, MdChat, MdBookmark, MdBarChart, MdTrendingUp, MdSearch, MdAssignment, MdSlideshow } from 'react-icons/md';

const Sidebar = ({ selectedArea, isLoading, aiSummary }) => {
  const [activeSection, setActiveSection] = useState('situation');
  const [enhancedLoading, setEnhancedLoading] = useState(false);
  const [showEnhancedRAG, setShowEnhancedRAG] = useState(false);
  const [showPresentationMode, setShowPresentationMode] = useState(false);
  const [evidenceSubSection, setEvidenceSubSection] = useState('builder');

  // Get borough state from store
  const { selectedBorough, viewMode, boroughData, isBoroughDataLoading, isZipCodeDataLoading } = useAppStore();

  // Define workflow-driven sections for Public Health Planners
  const PLANNER_WORKFLOW_SECTIONS = [
    {
      id: 'situation',
      label: 'Situation Assessment',
      icon: MdAnalytics,
      description: 'Current health status and risk profile'
    },
    {
      id: 'exploration', 
      label: 'Root Cause Analysis',
      icon: MdSearch,
      description: 'Understanding the drivers behind the data'
    },
    {
      id: 'planning',
      label: 'Action Planning', 
      icon: MdChat,
      description: 'Evidence-based intervention recommendations'
    },
    {
      id: 'evidence',
      label: 'Decision Support',
      icon: MdAssignment,
      description: 'Stakeholder materials and saved analysis'
    }
  ];

  const formatPercent = (value) => {
    if (value === undefined || value === null || value === '') return '0.00%';
    const num = Number(value);
    if (isNaN(num)) return '0.00%';
    return `${num.toFixed(2)}%`;
  };

  // Determine if we're showing borough-level data
  const isBoroughView = viewMode === 'borough';
  const isBoroughSelected = selectedBorough !== 'All';

  // Get display data based on view mode and selection
  const getDisplayData = () => {
    if (isBoroughView && selectedArea?.properties?.borough) {
      // Borough view mode with borough selected
      return {
        type: 'borough',
        name: selectedArea.properties.borough,
        data: selectedArea.properties
      };
    } else if (isBoroughSelected && boroughData && boroughData[selectedBorough]) {
      // Zip code view with borough filter
      return {
        type: 'borough-summary',
        name: selectedBorough,
        data: boroughData[selectedBorough]
      };
    } else if (selectedArea?.properties) {
      // Regular zip code view
      return {
        type: 'zipcode',
        name: selectedArea.properties.zip_code,
        data: selectedArea.properties
      };
    }
    return null;
  };

  const displayData = getDisplayData();

  // Memoize key metrics for performance - ALWAYS call this hook
  const keyMetrics = useMemo(() => {
    // Handle borough-level data when in borough view or borough selected
    if (displayData?.type === 'borough' && selectedArea?.properties?.borough) {
      // Borough selected in borough view mode
      const props = selectedArea.properties;
      return {
        riskScore: props.risk_score_avg?.toFixed(2) || 'N/A',
        diabetes: formatPercent(props.diabetes_avg),
        obesity: formatPercent(props.obesity_avg),
        hypertension: formatPercent(props.hypertension_avg),
        physicalActivity: formatPercent(props.physical_inactivity_avg),
        smoking: formatPercent(props.smoking_avg),
        foodInsecurity: formatPercent(props.food_insecurity_avg),
        healthcareAccess: formatPercent(props.healthcare_access_avg)
      };
    } else if (displayData?.type === 'borough-summary' && boroughData && selectedBorough !== 'All') {
      // Borough filter applied in zipcode view
      const boroughStats = boroughData[selectedBorough];
      return {
        riskScore: boroughStats?.risk_score_avg?.toFixed(2) || 'N/A',
        diabetes: formatPercent(boroughStats?.diabetes_avg),
        obesity: formatPercent(boroughStats?.obesity_avg),
        hypertension: formatPercent(boroughStats?.hypertension_avg),
        physicalActivity: formatPercent(boroughStats?.physical_inactivity_avg),
        smoking: formatPercent(boroughStats?.smoking_avg),
        foodInsecurity: formatPercent(boroughStats?.food_insecurity_avg),
        healthcareAccess: formatPercent(boroughStats?.healthcare_access_avg)
      };
    } else if (selectedArea?.properties) {
      // Regular zip code view
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
    }
    
    return null;
  }, [selectedArea?.properties, displayData, boroughData, selectedBorough]);

  // Early return AFTER all hooks are declared
  if (!selectedArea && !displayData) {
    // Show loading state if any data is still loading
    if (isBoroughDataLoading || isZipCodeDataLoading) {
      return (
        <div className="sidebar-empty-state">
          <div className="empty-state-content">
            <div className="loading-spinner large"></div>
            <h3>Loading RiskPulse Data</h3>
            <p>Preparing diabetes risk analysis tools...</p>
            <div className="loading-progress">
              <small>
                {isBoroughDataLoading && '🏢 Loading borough data...'}
                {isZipCodeDataLoading && '📍 Loading zip code data...'}
                {!isBoroughDataLoading && !isZipCodeDataLoading && '✅ Data loaded successfully'}
              </small>
            </div>
          </div>
        </div>
      );
    }

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

  const renderSituationAssessment = () => (
    <div className="section-content">
      {/* AI Summary - First and Prominent */}
      <div className="ai-analysis-header">
        <div className="section-header-clean">
          <MdTrendingUp className="section-icon-clean" />
          <h2>AI Health Analysis</h2>
        </div>
        {isLoading || 
         (viewMode === 'borough' && isBoroughDataLoading) || 
         (viewMode === 'zipcode' && isZipCodeDataLoading) ? (
          <div className="ai-loading-state-clean">
            <div className="loading-spinner"></div>
            <span>🧠 Analyzing diabetes risk patterns...</span>
            <small style={{ display: 'block', marginTop: '8px', opacity: 0.7, color: '#6b7280' }}>
              {viewMode === 'borough' && isBoroughDataLoading ? 
                'Loading borough data for analysis...' :
                viewMode === 'zipcode' && isZipCodeDataLoading ?
                'Loading zip code data for analysis...' :
                'Processing 8 health indicators with AI insights'
              }
            </small>
          </div>
        ) : (
          <div className="ai-summary-clean">
            <div className="ai-content">
              {aiSummary}
            </div>
          </div>
        )}
      </div>

      {/* Hero Metrics - Prominent Risk Display */}
      <HeroMetrics 
        keyMetrics={keyMetrics}
        displayData={displayData}
      />

      {/* Key Metrics Grid - Right after Top Concerns */}
      <div className="health-metrics-grid">
        <div className="section-header">
          <MdBarChart className="section-icon" />
          <h3>Detailed Health Metrics</h3>
          {(displayData?.type === 'borough' || displayData?.type === 'borough-summary') && (
            <small className="metrics-context">
              Borough averages across {displayData?.type === 'borough-summary' ? 
                boroughData?.[selectedBorough]?.zipCodeCount || 0 : 
                selectedArea?.properties?.zipCodeCount || 0
              } zip codes
            </small>
          )}
        </div>
        {isLoading || 
         (viewMode === 'borough' && isBoroughDataLoading) || 
         (viewMode === 'zipcode' && isZipCodeDataLoading) ? (
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
      
      {/* Context Strip - Moved after metrics */}
      <ContextStrip 
        displayData={displayData}
        comparisons={null} // Will be enhanced in Layer 2
      />
    </div>
  );

  const renderRootCauseExploration = () => {
    // Prepare data for correlation analysis
    const areaData = displayData?.data;
    const comparisonData = null; // Could be city/state averages in future
    
    // Mock neighborhood data for demonstration (will be enhanced with real neighbor selection)
    const mockNeighborhoodAreas = [
      {
        DIABETES_CrudePrev: 8.5,
        OBESITY_CrudePrev: 28.2,
        hypertension_avg: 32.1,
        physical_inactivity_avg: 22.8,
        smoking_avg: 14.3,
        food_insecurity_avg: 12.1
      },
      {
        DIABETES_CrudePrev: 9.8,
        OBESITY_CrudePrev: 31.5,
        hypertension_avg: 35.7,
        physical_inactivity_avg: 26.1,
        smoking_avg: 16.8,
        food_insecurity_avg: 15.4
      }
    ];

    return (
      <div className="section-content">
        <div className="section-header">
          <MdSearch className="section-icon" />
          <h3>Root Cause Analysis</h3>
          <small className="section-description">
            Understanding why this area shows elevated diabetes risk
          </small>
        </div>
        
        {/* Layer 2: Root Cause Analysis Panel */}
        <RootCausePanel 
          areaData={areaData}
          comparisonData={comparisonData}
          isLoading={isLoading || isBoroughDataLoading || isZipCodeDataLoading}
        />
        
        {/* Layer 2: Neighborhood Comparison */}
        <NeighborhoodComparison 
          targetArea={areaData}
          neighborhoodAreas={selectedArea ? mockNeighborhoodAreas : []}
          isLoading={isLoading || isBoroughDataLoading || isZipCodeDataLoading}
          viewMode={viewMode}
        />
      </div>
    );
  };

  const renderActionPlanning = () => (
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

  const renderDecisionSupport = () => {
    // Prepare area data for evidence generation
    const areaData = displayData?.data || selectedArea?.properties;
    
    return (
      <div className="section-content">
        <div className="section-header">
          <MdAssignment className="section-icon" />
          <h3>Evidence & Decision Support</h3>
          <small className="section-description">
            Professional materials for stakeholder presentations and funding requests
          </small>
        </div>
        
        {/* Evidence Section Navigation */}
        <div className="evidence-navigation">
          <button 
            className={`evidence-nav-btn ${evidenceSubSection === 'builder' ? 'active' : ''}`}
            onClick={() => setEvidenceSubSection('builder')}
          >
            <MdAssignment />
            Evidence Builder
          </button>
          <button 
            className={`evidence-nav-btn ${evidenceSubSection === 'presentation' ? 'active' : ''}`}
            onClick={() => setEvidenceSubSection('presentation')}
          >
            <MdSlideshow />
            Presentation Mode
          </button>
          <button 
            className={`evidence-nav-btn ${evidenceSubSection === 'history' ? 'active' : ''}`}
            onClick={() => setEvidenceSubSection('history')}
          >
            <MdBookmark />
            Analysis History
          </button>
        </div>
        
        {/* Evidence Sub-Section Content */}
        {evidenceSubSection === 'builder' && (
          <EvidenceBuilder 
            areaData={areaData}
            onPackageGenerated={(packageData) => {
              // Package generation complete - could trigger notification or other actions
            }}
            className="evidence-section"
          />
        )}
        
        {evidenceSubSection === 'presentation' && (
          <div className="presentation-section">
            <div className="presentation-intro">
              <h4>Stakeholder Presentation</h4>
              <p>Create professional slide presentations for decision-makers and stakeholders.</p>              <button
                className="launch-presentation-btn"
                onClick={() => setShowPresentationMode(true)}
                disabled={!areaData}
              >
                <MdSlideshow />
                Launch Presentation Mode
              </button>
            </div>
            
            {areaData && (
              <div className="presentation-preview">
                <h5>Available Slides</h5>
                <div className="slide-list">
                  <div className="slide-item">� Executive Summary</div>
                  <div className="slide-item">📍 Risk Overview</div>
                  <div className="slide-item">🔍 Root Cause Analysis</div>
                  <div className="slide-item">💡 Action Plan</div>
                  <div className="slide-item">� Evidence & Data</div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {evidenceSubSection === 'history' && (
          <div className="evidence-section">
            <h4>Analysis History</h4>
            <SavedAnalysesList />
          </div>
        )}
      </div>
    );
  };

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
        {PLANNER_WORKFLOW_SECTIONS.map(section => {
          const IconComponent = section.icon;
          return (
            <button 
              key={section.id}
              className={`section-nav-btn ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveSection(section.id);
                }
              }}
              role="tab"
              aria-selected={activeSection === section.id}
              aria-controls={`${section.id}-panel`}
              title={section.description}
            >
              <IconComponent className="nav-icon" />
              <span>{section.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Section Content */}
      <div className="section-container">
        {activeSection === 'situation' && (
          <div role="tabpanel" id="situation-panel" aria-labelledby="situation-tab">
            {renderSituationAssessment()}
          </div>
        )}
        {activeSection === 'exploration' && (
          <div role="tabpanel" id="exploration-panel" aria-labelledby="exploration-tab">
            {renderRootCauseExploration()}
          </div>
        )}
        {activeSection === 'planning' && (
          <div role="tabpanel" id="planning-panel" aria-labelledby="planning-tab">
            {renderActionPlanning()}
          </div>
        )}
        {activeSection === 'evidence' && (
          <div role="tabpanel" id="evidence-panel" aria-labelledby="evidence-tab">
            {renderDecisionSupport()}
          </div>
        )}
      </div>
      
      {/* Layer 3: Presentation Mode Overlay */}
      {showPresentationMode && (
        <PresentationMode 
          areaData={displayData?.data || selectedArea?.properties}
          onClose={() => setShowPresentationMode(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;