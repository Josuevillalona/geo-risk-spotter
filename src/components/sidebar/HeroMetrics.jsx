import React from 'react';
import { MdTrendingUp, MdTrendingDown, MdTrendingFlat } from 'react-icons/md';

const RiskTrendIndicator = ({ value }) => {
  const riskValue = parseFloat(value);
  
  if (isNaN(riskValue)) {
    return <MdTrendingFlat className="risk-trend-neutral" />;
  }
  
  if (riskValue >= 7) {
    return <MdTrendingUp className="risk-trend-high" />;
  } else if (riskValue >= 4) {
    return <MdTrendingFlat className="risk-trend-medium" />;
  } else {
    return <MdTrendingDown className="risk-trend-low" />;
  }
};

const CriticalFactors = ({ metrics }) => {
  if (!metrics) return null;
  
  // Identify top 3 concerning factors based on percentages
  const factors = [
    { key: 'diabetes', label: 'Diabetes', value: metrics.diabetes },
    { key: 'obesity', label: 'Obesity', value: metrics.obesity },
    { key: 'hypertension', label: 'Hypertension', value: metrics.hypertension },
    { key: 'physicalActivity', label: 'Physical Inactivity', value: metrics.physicalActivity },
    { key: 'smoking', label: 'Smoking', value: metrics.smoking },
    { key: 'foodInsecurity', label: 'Food Insecurity', value: metrics.foodInsecurity }
  ];
  
  // Sort by percentage value and take top 3
  const topConcerns = factors
    .filter(f => f.value && f.value !== 'N/A' && f.value !== '0.00%')
    .sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
    .slice(0, 3);
    
  if (topConcerns.length === 0) return null;
  
  return (
    <div className="critical-factors">
      <span className="factors-label">Top Concerns:</span>
      <div className="factors-list">
        {topConcerns.map(factor => (
          <span key={factor.key} className="factor-tag">
            {factor.label} {factor.value}
          </span>
        ))}
      </div>
    </div>
  );
};

const HeroMetrics = ({ keyMetrics, displayData }) => {
  const riskScore = keyMetrics?.riskScore || 'N/A';
  const riskLevel = parseFloat(riskScore);
  
  const getRiskCategory = (score) => {
    if (isNaN(score)) return { label: 'Unknown', class: 'risk-unknown' };
    if (score >= 7) return { label: 'High Risk', class: 'risk-high' };
    if (score >= 4) return { label: 'Moderate Risk', class: 'risk-moderate' };
    return { label: 'Lower Risk', class: 'risk-low' };
  };
  
  const riskCategory = getRiskCategory(riskLevel);
  
  return (
    <div className="hero-metrics">
      {/* Primary Risk Indicator */}
      <div className="primary-risk-indicator">
        <div className={`risk-score-hero ${riskCategory.class}`}>
          <div className="risk-score-container">
            <span className="risk-value">{riskScore}</span>
            <div className="risk-details">
              <span className="risk-label">Risk Score</span>
              <span className="risk-category">{riskCategory.label}</span>
            </div>
            <RiskTrendIndicator value={riskScore} />
          </div>
        </div>
      </div>
      
      {/* Area Context Information */}
      <div className="area-context">
        <div className="context-primary">
          <span className="area-name">
            {displayData?.name || 'Select an area'}
          </span>
          <span className="area-type">
            {displayData?.type === 'borough' ? 'Borough Average' :
             displayData?.type === 'borough-summary' ? 'Borough Summary' :
             displayData?.type === 'zipcode' ? 'ZIP Code' : 'Area'}
          </span>
        </div>
      </div>
      
      {/* Critical Factors Summary */}
      <CriticalFactors metrics={keyMetrics} />
    </div>
  );
};

export default HeroMetrics;
