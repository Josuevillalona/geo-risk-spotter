import React from 'react';
import { MdTrendingUp, MdTrendingDown, MdCompareArrows, MdWarning } from 'react-icons/md';

/**
 * Reusable Factor Card Component
 * Used across Layer 2 components for consistent factor display
 */
const FactorCard = ({ 
  factor, 
  rank, 
  variant = 'primary', 
  showComparison = false,
  showRank = true 
}) => {
  const getRiskColor = (severity) => {
    const colors = {
      critical: '#dc2626',
      elevated: '#f59e0b', 
      normal: '#22c55e',
      low: '#22c55e'
    };
    return colors[severity] || '#6b7280';
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'immediate') return '🚨';
    if (priority === 'planned') return '📋';
    return '💡';
  };

  const getImpactBadgeColor = (impact) => {
    const colors = {
      high: '#dc2626',
      moderate: '#f59e0b',
      low: '#22c55e',
      protective: '#3b82f6'
    };
    return colors[impact] || '#6b7280';
  };

  const formatValue = (value) => {
    if (typeof value === 'number') {
      return `${value.toFixed(1)}%`;
    }
    return value || 'N/A';
  };

  return (
    <div className={`factor-card factor-${variant}`}>
      <div className="factor-header">
        {showRank && (
          <div className="factor-rank">
            <span className="rank-number">#{rank}</span>
          </div>
        )}
        
        <div className="factor-info">
          <h5 className="factor-label">{factor.label}</h5>
          <span className="factor-category">{factor.category}</span>
        </div>
        
        <div className="factor-value">
          <span 
            className="value-display"
            style={{ color: getRiskColor(factor.severity) }}
          >
            {factor.displayValue || formatValue(factor.value)}
          </span>
          {factor.actionPriority && (
            <span className="priority-icon" title={`${factor.actionPriority} priority`}>
              {getPriorityIcon(factor.actionPriority)}
            </span>
          )}
        </div>
      </div>
      
      {factor.description && (
        <p className="factor-description">{factor.description}</p>
      )}
      
      {showComparison && factor.comparison && (
        <div className="factor-comparison">
          <MdCompareArrows className="comparison-icon" />
          <span className="comparison-text">
            {factor.comparison.isHigher ? (
              <span className="worse-comparison">
                <MdTrendingUp className="trend-icon" />
                +{factor.comparison.percentDifference.toFixed(1)}% vs. reference
              </span>
            ) : (
              <span className="better-comparison">
                <MdTrendingDown className="trend-icon" />
                {factor.comparison.percentDifference.toFixed(1)}% vs. reference
              </span>
            )}
          </span>
        </div>
      )}
      
      <div className="factor-indicators">
        <div 
          className={`severity-indicator severity-${factor.severity}`}
          style={{ backgroundColor: getRiskColor(factor.severity) }}
        >
          <span className="severity-text">{factor.severity.toUpperCase()}</span>
          {factor.severity === 'critical' && <MdWarning className="severity-icon" />}
        </div>
        
        {factor.impact && (
          <div 
            className={`impact-indicator impact-${factor.impact}`}
            style={{ color: getImpactBadgeColor(factor.impact) }}
          >
            <span className="impact-text">{factor.impact.toUpperCase()} IMPACT</span>
          </div>
        )}
        
        {factor.confidence && (
          <div className={`confidence-indicator confidence-${factor.confidence}`}>
            <span className="confidence-text">{factor.confidence.toUpperCase()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FactorCard;
