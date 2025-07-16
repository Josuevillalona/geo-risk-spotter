import React, { useState, useMemo } from 'react';
import RecommendationsTab from './components/RecommendationsTab';
import EnhancedInterventionDisplay from './components/EnhancedInterventionDisplay';
import SavedAnalysesList from './components/sidebar/SavedAnalysesList';
import HeroMetrics from './components/sidebar/HeroMetrics';
import EnhancedMetricsDisplay from './components/sidebar/EnhancedMetricsDisplay';
import RootCausePanel from './components/sidebar/RootCausePanel';
import NeighborhoodComparison from './components/sidebar/NeighborhoodComparison';
import EvidenceBuilder from './components/evidence/EvidenceBuilder';
import { useAppStore } from './store';
import { MdAnalytics, MdChat, MdBookmark, MdBarChart, MdTrendingUp, MdSearch, MdAssignment } from 'react-icons/md';
import './components/sidebar/EnhancedMetricsDisplay.css';
import './components/sidebar/ModernSidebar.css';

const Sidebar = ({ selectedArea, isLoading, aiSummary }) => {
  const [activeSection, setActiveSection] = useState('intelligence');
  const [enhancedLoading, setEnhancedLoading] = useState(false);
  const [showEnhancedRAG, setShowEnhancedRAG] = useState(false);
  const [showPresentationMode, setShowPresentationMode] = useState(false);

  // Get borough state from store
  const { selectedBorough, viewMode, boroughData, isBoroughDataLoading, isZipCodeDataLoading } = useAppStore();

  // Define workflow-driven sections for Public Health Planners - CONSOLIDATED
  const PLANNER_WORKFLOW_SECTIONS = [
    {
      id: 'intelligence',
      label: 'Hotspot Intelligence',
      icon: MdAnalytics,
      description: 'Comprehensive risk assessment and driver analysis'
    },
    {
      id: 'interventions',
      label: 'Proven Interventions',
      icon: MdTrendingUp,
      description: 'Evidence-based programs matched to your community profile'
    },
    {
      id: 'planning',
      label: 'Action Planning', 
      icon: MdChat,
      description: 'AI-powered consultation for intervention strategy'
    },
    {
      id: 'evidence',
      label: 'Report Builder',
      icon: MdAssignment,
      description: 'Professional report generation for stakeholders'
    }
  ];

  const formatPercent = (value, fieldName = '') => {
    if (value === undefined || value === null || value === '') return 'N/A';
    const num = Number(value);
    if (isNaN(num)) return 'N/A';
    
    // For social determinants that commonly have missing data, show "No Data" instead of 0.00%
    const socialDeterminantFields = ['ISOLATION_CrudePrev', 'HOUSINSECU_CrudePrev', 'LACKTRPT_CrudePrev', 'FOODSTAMP_CrudePrev', 'FOODINSECU_CrudePrev'];
    if (num === 0 && socialDeterminantFields.some(field => fieldName.includes(field))) {
      return 'No Data';
    }
    
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
      // Regular zip code view with enhanced metrics
      const { properties } = selectedArea;
      return {
        // Core risk metrics (original - maintain backward compatibility)
        riskScore: properties.RiskScore?.toFixed(2) || 'N/A',
        diabetes: formatPercent(properties.DIABETES_CrudePrev),
        obesity: formatPercent(properties.OBESITY_CrudePrev),
        hypertension: formatPercent(properties.BPHIGH_CrudePrev),
        physicalActivity: formatPercent(properties.LPA_CrudePrev),
        smoking: formatPercent(properties.CSMOKING_CrudePrev),
        foodInsecurity: formatPercent(properties.FOODINSECU_CrudePrev, 'FOODINSECU_CrudePrev'),
        healthcareAccess: formatPercent(properties.ACCESS2_CrudePrev),
        
        // Population demographics (new)
        totalPopulation: properties.TotalPopulation ? Math.round(properties.TotalPopulation).toLocaleString() : 'N/A',
        adultPopulation: properties.TotalPop18plus ? Math.round(properties.TotalPop18plus).toLocaleString() : 'N/A',
        
        // Social determinants of health (new)
        depression: formatPercent(properties.DEPRESSION_CrudePrev, 'DEPRESSION_CrudePrev'),
        socialIsolation: formatPercent(properties.ISOLATION_CrudePrev, 'ISOLATION_CrudePrev'),
        housingInsecurity: formatPercent(properties.HOUSINSECU_CrudePrev, 'HOUSINSECU_CrudePrev'),
        transportationBarriers: formatPercent(properties.LACKTRPT_CrudePrev, 'LACKTRPT_CrudePrev'),
        foodStampUsage: formatPercent(properties.FOODSTAMP_CrudePrev, 'FOODSTAMP_CrudePrev'),
        
        // Additional health outcomes (new)
        generalHealth: formatPercent(properties.GHLTH_CrudePrev),
        mentalHealth: formatPercent(properties.MHLTH_CrudePrev),
        physicalHealth: formatPercent(properties.PHLTH_CrudePrev),
        routineCheckup: formatPercent(properties.CHECKUP_CrudePrev),
        dentalVisit: formatPercent(properties.DENTAL_CrudePrev),
        sleepDuration: formatPercent(properties.SLEEP_CrudePrev)
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

  const renderHotspotIntelligence = () => {
    // Get area name for display
    const getAreaDisplayText = () => {
      if (displayData?.type === 'borough' || displayData?.type === 'borough-summary') {
        return `${displayData.name} Borough`;
      } else if (displayData?.type === 'zipcode') {
        return `ZIP Code ${displayData.name}`;
      } else if (selectedArea?.properties?.zip_code) {
        return `ZIP Code ${selectedArea.properties.zip_code}`;
      } else if (selectedArea?.properties?.borough) {
        return `${selectedArea.properties.borough} Borough`;
      }
      return 'Selected Area';
    };

    // Get risk category for integrated display
    const getRiskCategory = (score) => {
      const riskValue = parseFloat(score);
      if (isNaN(riskValue)) return { label: 'Assessment Pending', class: 'risk-unknown' };
      if (riskValue >= 20) return { label: 'High Risk', class: 'risk-high' };
      if (riskValue >= 15) return { label: 'Moderate Risk', class: 'risk-moderate' };
      if (riskValue >= 10) return { label: 'Elevated Risk', class: 'risk-elevated' };
      return { label: 'Lower Risk', class: 'risk-low' };
    };

    const riskCategory = getRiskCategory(keyMetrics?.riskScore);

    return (
      <div className="section-content">
        {/* UNIFIED: AI Analysis + Primary Risk Display */}
        <div className="intelligence-header">
          <div className="section-header-modern">
            <div className="header-icon-wrapper">
              <MdAnalytics className="section-icon-modern" />
            </div>
            <div className="header-text">
              <h2 className="section-title-modern">Hotspot Intelligence</h2>
              <p className="section-subtitle-modern">{getAreaDisplayText()}</p>
            </div>
          </div>
          
          {isLoading || 
           (viewMode === 'borough' && isBoroughDataLoading) || 
           (viewMode === 'zipcode' && isZipCodeDataLoading) ? (
            <div className="ai-loading-modern">
              <div className="loading-spinner-modern"></div>
              <div className="loading-text">
                <span className="loading-primary">Analyzing diabetes risk patterns</span>
                <small className="loading-secondary">
                  {viewMode === 'borough' && isBoroughDataLoading ? 
                    'Loading borough data for analysis...' :
                    viewMode === 'zipcode' && isZipCodeDataLoading ?
                    'Loading zip code data for analysis...' :
                    'Processing health indicators with AI insights'
                  }
                </small>
              </div>
            </div>
          ) : (
            <div className="ai-summary-modern">
              <div className="ai-content-modern">
                {aiSummary}
              </div>
              
              {/* INTEGRATED: Primary Risk Score with AI Summary */}
              <div className="primary-risk-integrated">
                <div className="risk-assessment-card">
                  <div className="risk-header">
                    <span className="risk-label">Overall Risk Assessment</span>
                    <span className={`risk-badge ${riskCategory.class}`}>
                      {riskCategory.label}
                    </span>
                  </div>
                  <div className="risk-score-display">
                    <span className="risk-score-value">
                      {keyMetrics?.riskScore || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* OPTIMIZED: Single Comprehensive Metrics Display */}
        <div className="key-indicators-modern">
          <div className="section-header-modern">
            <div className="header-icon-wrapper">
              <MdBarChart className="section-icon-modern" />
            </div>
            <div className="header-text">
              <h3 className="section-title-modern">Key Health Indicators</h3>
              <p className="section-subtitle-modern">
                Essential metrics for intervention planning
                {(displayData?.type === 'borough' || displayData?.type === 'borough-summary') && (
                  <span className="context-note">
                    {' '}• Borough averages across {displayData?.type === 'borough-summary' ? 
                      boroughData?.[selectedBorough]?.zipCodeCount || 0 : 
                      selectedArea?.properties?.zipCodeCount || 0
                    } zip codes
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {isLoading || 
           (viewMode === 'borough' && isBoroughDataLoading) || 
           (viewMode === 'zipcode' && isZipCodeDataLoading) ? (
            <div className="metrics-loading-modern">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="metric-skeleton-modern"></div>
              ))}
            </div>
          ) : (
            <div className="metrics-grid-optimized">
              {/* Primary Metric: Diabetes Prevalence */}
              <div className="metric-card-modern primary" title="Percentage of adults aged 20+ diagnosed with diabetes">
                <div className="metric-header">
                  <span className="metric-label">Diabetes Prevalence</span>
                  <span className="metric-badge primary">Primary</span>
                </div>
                <span className="metric-value-modern primary">
                  {keyMetrics?.diabetes || 'N/A'}
                </span>
              </div>
              
              {/* Core Risk Factors */}
              <div className="metric-card-modern" title="Percentage of adults with BMI ≥30">
                <div className="metric-header">
                  <span className="metric-label">Obesity Rate</span>
                </div>
                <span className="metric-value-modern">
                  {keyMetrics?.obesity || 'N/A'}
                </span>
              </div>
              
              <div className="metric-card-modern" title="Percentage of adults with high blood pressure">
                <div className="metric-header">
                  <span className="metric-label">Hypertension</span>
                </div>
                <span className="metric-value-modern">
                  {keyMetrics?.hypertension || 'N/A'}
                </span>
              </div>
              
              <div className="metric-card-modern" title="Percentage of adults with no leisure-time physical activity">
                <div className="metric-header">
                  <span className="metric-label">Physical Inactivity</span>
                </div>
                <span className="metric-value-modern">
                  {keyMetrics?.physicalActivity || 'N/A'}
                </span>
              </div>
              
              <div className="metric-card-modern" title="Percentage of households with limited food access">
                <div className="metric-header">
                  <span className="metric-label">Food Insecurity</span>
                </div>
                <span className="metric-value-modern">
                  {keyMetrics?.foodInsecurity || 'N/A'}
                </span>
              </div>
              
              <div className="metric-card-modern" title="Percentage of adults with limited healthcare access">
                <div className="metric-header">
                  <span className="metric-label">Healthcare Access</span>
                </div>
                <span className="metric-value-modern">
                  {keyMetrics?.healthcareAccess || 'N/A'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ENHANCED: Additional Context (Collapsible) */}
        <div className="additional-context-modern">
          <EnhancedMetricsDisplay keyMetrics={keyMetrics} />
        </div>

        {/* INTEGRATED: Root Cause Analysis - Seamless Transition */}
        <div className="root-cause-integration-modern">
          <div className="section-transition-modern">
            <div className="transition-line"></div>
            <div className="transition-content">
              <div className="section-header-modern">
                <div className="header-icon-wrapper">
                  <MdSearch className="section-icon-modern" />
                </div>
                <div className="header-text">
                  <h3 className="section-title-modern">Understanding the Drivers</h3>
                  <p className="section-subtitle-modern">
                    Why does this area show elevated diabetes risk?
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="root-cause-components-modern">
            <RootCausePanel 
              areaData={displayData?.data}
              comparisonData={null}
              isLoading={isLoading || isBoroughDataLoading || isZipCodeDataLoading}
            />
            
            <NeighborhoodComparison 
              targetArea={displayData?.data}
              neighborhoodAreas={selectedArea ? [
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
              ] : []}
              isLoading={isLoading || isBoroughDataLoading || isZipCodeDataLoading}
              viewMode={viewMode}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderProvenInterventions = () => (
    <div className="section-content">
      <div className="section-header-modern">
        <div className="header-icon-wrapper">
          <MdTrendingUp className="section-icon-modern" />
        </div>
        <div className="header-text">
          <h2 className="section-title-modern">Proven Interventions</h2>
          <p className="section-subtitle-modern">
            Evidence-based programs matched to your community's health profile
          </p>
        </div>
      </div>
      
      <div className="intervention-matching-info">
        <div className="info-card-modern">
          <div className="info-icon">🎯</div>
          <div className="info-content">
            <h3>Smart Matching</h3>
            <p>Programs proven successful in similar communities</p>
          </div>
        </div>
        
        <div className="info-card-modern">
          <div className="info-icon">📊</div>
          <div className="info-content">
            <h3>Evidence-Based</h3>
            <p>Implementation details and success metrics included</p>
          </div>
        </div>
      </div>

      <div className="enhanced-intervention-container">
        <EnhancedInterventionDisplay 
          selectedArea={selectedArea} 
          isLoading={enhancedLoading}
          setIsLoading={setEnhancedLoading}
        />
      </div>
    </div>
  );

  const renderActionPlanning = () => (
    <div className="section-content">
      <div className="section-header-modern">
        <div className="header-icon-wrapper">
          <MdChat className="section-icon-modern" />
        </div>
        <div className="header-text">
          <h2 className="section-title-modern">Action Planning</h2>
          <p className="section-subtitle-modern">
            AI-powered consultation for intervention strategy and implementation
          </p>
        </div>
      </div>

      <div className="chatbot-container-modern">
        <RecommendationsTab selectedArea={selectedArea} />
      </div>
    </div>
  );

  const renderDecisionSupport = () => {
    // Prepare area data for evidence generation
    const areaData = displayData?.data || selectedArea?.properties;
    
    return (
      <div className="section-content">
        {/* Report Builder Content */}
        <EvidenceBuilder 
          areaData={areaData}
          onPackageGenerated={(packageData) => {
            // Package generation complete - could trigger notification or other actions
          }}
          className="report-builder-section"
        />
      </div>
    );
  };

  return (
    <div className="sidebar-wrapper">
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
        {activeSection === 'intelligence' && (
          <div role="tabpanel" id="intelligence-panel" aria-labelledby="intelligence-tab">
            {renderHotspotIntelligence()}
          </div>
        )}
        {activeSection === 'interventions' && (
          <div role="tabpanel" id="interventions-panel" aria-labelledby="interventions-tab">
            {renderProvenInterventions()}
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