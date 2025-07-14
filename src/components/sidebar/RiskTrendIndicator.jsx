import React from 'react';
import { MdTrendingUp, MdTrendingDown, MdTrendingFlat, MdWarning } from 'react-icons/md';

const RiskTrendIndicator = ({ value, size = 'medium', showTooltip = true }) => {
  const riskValue = parseFloat(value);
  
  const getRiskInfo = (risk) => {
    if (isNaN(risk)) {
      return {
        icon: MdTrendingFlat,
        class: 'risk-trend-neutral',
        label: 'Risk level unknown',
        description: 'Insufficient data to determine risk level'
      };
    }
    
    if (risk >= 8) {
      return {
        icon: MdWarning,
        class: 'risk-trend-critical',
        label: 'Critical risk level',
        description: 'Immediate intervention recommended'
      };
    } else if (risk >= 6) {
      return {
        icon: MdTrendingUp,
        class: 'risk-trend-high',
        label: 'High risk level',
        description: 'Priority area for intervention'
      };
    } else if (risk >= 4) {
      return {
        icon: MdTrendingFlat,
        class: 'risk-trend-medium',
        label: 'Moderate risk level',
        description: 'Monitor and consider preventive measures'
      };
    } else {
      return {
        icon: MdTrendingDown,
        class: 'risk-trend-low',
        label: 'Lower risk level',
        description: 'Maintain current health promotion efforts'
      };
    }
  };
  
  const riskInfo = getRiskInfo(riskValue);
  const IconComponent = riskInfo.icon;
  
  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'risk-trend-sm';
      case 'large': return 'risk-trend-lg';
      default: return 'risk-trend-md';
    }
  };
  
  const indicator = (
    <div className={`risk-trend-indicator ${riskInfo.class} ${getSizeClass()}`}>
      <IconComponent 
        className={`risk-trend-icon ${getSizeClass()}`}
        aria-label={riskInfo.label}
      />
    </div>
  );
  
  if (showTooltip) {
    return (
      <div 
        className="risk-trend-container"
        title={`${riskInfo.label}: ${riskInfo.description}`}
      >
        {indicator}
      </div>
    );
  }
  
  return indicator;
};

export default RiskTrendIndicator;
