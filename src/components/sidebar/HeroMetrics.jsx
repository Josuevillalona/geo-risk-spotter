import React from 'react';
import { MdTrendingUp, MdTrendingDown, MdTrendingFlat, MdLocationOn, MdWarning, MdCheckCircle } from 'react-icons/md';

const RiskTrendIndicator = ({ value }) => {
  const riskValue = parseFloat(value);
  
  if (isNaN(riskValue)) {
    return <MdTrendingFlat className="risk-trend-neutral" />;
  }
  
  if (riskValue >= 20) {
    return <MdTrendingUp className="risk-trend-high" />;
  } else if (riskValue >= 15) {
    return <MdTrendingFlat className="risk-trend-medium" />;
  } else {
    return <MdTrendingDown className="risk-trend-low" />;
  }
};

const RiskIndicatorIcon = ({ score }) => {
  const riskValue = parseFloat(score);
  
  if (isNaN(riskValue)) return <MdWarning className="risk-icon-unknown" />;
  if (riskValue >= 20) return <MdWarning className="risk-icon-high" />;
  if (riskValue >= 15) return <MdTrendingUp className="risk-icon-moderate" />;
  return <MdCheckCircle className="risk-icon-low" />;
};

const CriticalFactors = ({ metrics }) => {
  if (!metrics) return null;
  
  // Enhanced factor analysis with better thresholds
  const factors = [
    { key: 'diabetes', label: 'Diabetes', value: metrics.diabetes, threshold: 10 },
    { key: 'obesity', label: 'Obesity', value: metrics.obesity, threshold: 25 },
    { key: 'hypertension', label: 'Hypertension', value: metrics.hypertension, threshold: 30 },
    { key: 'physicalActivity', label: 'Physical Inactivity', value: metrics.physicalActivity, threshold: 25 },
    { key: 'smoking', label: 'Smoking', value: metrics.smoking, threshold: 15 },
    { key: 'foodInsecurity', label: 'Food Insecurity', value: metrics.foodInsecurity, threshold: 10 }
  ];
  
  // Get factors above threshold and sort by severity
  const concerningFactors = factors
    .filter(f => {
      if (!f.value || f.value === 'N/A') return false;
      const numValue = parseFloat(f.value);
      return !isNaN(numValue) && numValue >= f.threshold;
    })
    .sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
    .slice(0, 3);
    
  if (concerningFactors.length === 0) {
    return (
      <div className="critical-factors">
        <div className="factors-header">
          <MdCheckCircle className="factors-icon positive" />
          <span className="factors-label">Health Status: All metrics within normal ranges</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="critical-factors">
      <div className="factors-header">
        <MdWarning className="factors-icon warning" />
        <span className="factors-label">Key Concerns ({concerningFactors.length})</span>
      </div>
      <div className="factors-list">
        {concerningFactors.map((factor, index) => (
          <div key={factor.key} className={`factor-tag priority-${index + 1}`}>
            <span className="factor-name">{factor.label}</span>
            <span className="factor-value">{factor.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const HeroMetrics = ({ keyMetrics, displayData }) => {
  const riskScore = keyMetrics?.riskScore || 'N/A';
  const riskLevel = parseFloat(riskScore);
  
  const getRiskCategory = (score) => {
    if (isNaN(score)) return { label: 'Unknown', class: 'risk-unknown', priority: 'unknown' };
    if (score >= 20) return { label: 'High Risk', class: 'risk-high', priority: 'critical' };
    if (score >= 15) return { label: 'Moderate Risk', class: 'risk-moderate', priority: 'moderate' };
    if (score >= 10) return { label: 'Elevated Risk', class: 'risk-elevated', priority: 'elevated' };
    return { label: 'Lower Risk', class: 'risk-low', priority: 'low' };
  };
  
  const riskCategory = getRiskCategory(riskLevel);
  
  // Format area name for better display
  const getAreaDisplayName = () => {
    if (!displayData?.name) return 'Select an area to analyze';
    
    if (displayData.type === 'borough' || displayData.type === 'borough-summary') {
      return `${displayData.name} Borough`;
    }
    
    if (displayData.type === 'zipcode') {
      return `ZIP Code ${displayData.name}`;
    }
    
    return displayData.name;
  };
  
  const getAreaDisplayType = () => {
    if (!displayData?.type) return '';
    
    switch (displayData.type) {
      case 'borough':
        return 'Borough Overview';
      case 'borough-summary':
        return 'Borough Analysis';
      case 'zipcode':
        return displayData.data?.borough ? `${displayData.data.borough} ZIP Code` : 'ZIP Code Analysis';
      default:
        return 'Health Analysis';
    }
  };
  
  return (
    <div className="hero-metrics">
      {/* Enhanced Primary Risk Indicator */}
      <div className="primary-risk-card">
        <div className={`risk-score-hero ${riskCategory.class}`}>
          <div className="risk-header">
            <div className="risk-icon-container">
              <RiskIndicatorIcon score={riskScore} />
            </div>
            <div className="risk-priority-badge">
              <span className={`priority-indicator ${riskCategory.priority}`}>
                {riskCategory.priority.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="risk-score-display">
            <span className="risk-value">{riskScore}</span>
            <div className="risk-details">
              <span className="risk-label">Risk Score</span>
              <div className="risk-category-container">
                <span className="risk-category">{riskCategory.label}</span>
                <RiskTrendIndicator value={riskScore} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Area Context */}
      <div className="area-context-card">
        <div className="context-header">
          <MdLocationOn className="location-icon" />
          <div className="area-info">
            <h4 className="area-name">{getAreaDisplayName()}</h4>
            <span className="area-type">{getAreaDisplayType()}</span>
          </div>
        </div>
        
        {displayData?.type === 'borough-summary' && displayData?.data?.zipCodeCount && (
          <div className="coverage-indicator">
            <span className="coverage-text">
              Analysis covers {displayData.data.zipCodeCount} ZIP codes
            </span>
          </div>
        )}
      </div>
      
      {/* Enhanced Critical Factors */}
      <CriticalFactors metrics={keyMetrics} />
    </div>
  );
};

export default HeroMetrics;
