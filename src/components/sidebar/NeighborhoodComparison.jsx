import React, { useState, useEffect, useMemo } from 'react';
import { 
  MdCompareArrows, 
  MdTrendingUp, 
  MdTrendingDown,
  MdLocationOn,
  MdExpandMore,
  MdExpandLess,
  MdInfo
} from 'react-icons/md';
import { generateNeighborhoodComparison, HEALTH_METRICS } from '../../services/correlationAnalysis';

/**
 * Neighborhood Comparison Component
 * Compares selected area to neighboring areas
 * Part of Layer 2: Correlation Insights Engine
 */
const NeighborhoodComparison = ({ 
  targetArea, 
  neighborhoodAreas = [], 
  isLoading = false,
  viewMode = 'zipcode'
}) => {
  const [comparison, setComparison] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({
    clinical: true,
    behavioral: false,
    social: false
  });
  const [selectedMetric, setSelectedMetric] = useState(null);

  // Generate comparison analysis
  const comparisonData = useMemo(() => {
    if (!targetArea || !neighborhoodAreas.length) return null;
    return generateNeighborhoodComparison(targetArea, neighborhoodAreas);
  }, [targetArea, neighborhoodAreas]);

  useEffect(() => {
    setComparison(comparisonData);
  }, [comparisonData]);

  // Group comparisons by category
  const groupedComparisons = useMemo(() => {
    if (!comparison?.comparisons) return {};
    
    const groups = {
      clinical: [],
      behavioral: [],
      social: []
    };

    comparison.comparisons.forEach(comp => {
      if (comp.category === 'Clinical Outcomes' || comp.category === 'Clinical Risk Factors') {
        groups.clinical.push(comp);
      } else if (comp.category === 'Behavioral Risk Factors') {
        groups.behavioral.push(comp);
      } else if (comp.category === 'Social Determinants') {
        groups.social.push(comp);
      }
    });

    return groups;
  }, [comparison]);

  // Toggle category expansion
  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  if (isLoading) {
    return (
      <div className="neighborhood-comparison loading">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!targetArea) {
    return (
      <div className="neighborhood-comparison empty">
        <div className="empty-state">
          <MdLocationOn className="text-gray-400" size={24} />
          <p className="text-gray-600">Select an area to compare with neighbors</p>
        </div>
      </div>
    );
  }

  if (!comparison || !neighborhoodAreas.length) {
    return (
      <div className="neighborhood-comparison no-data">
        <div className="no-data-state">
          <MdInfo className="text-blue-400" size={24} />
          <p className="text-gray-600">
            No neighboring {viewMode === 'borough' ? 'boroughs' : 'zip codes'} available for comparison
          </p>
        </div>
      </div>
    );
  }

  const { summary, neighborhoodCount } = comparison;

  return (
    <div className="neighborhood-comparison">
      {/* Header */}
      <div className="comparison-header">
        <div className="header-content">
          <h3 className="comparison-title">Neighborhood Comparison</h3>
          <div className="comparison-info">
            <span className="neighbor-count">
              vs. {neighborhoodCount} neighboring {viewMode === 'borough' ? 'boroughs' : 'areas'}
            </span>
          </div>
        </div>
        
        {/* Summary */}
        <div className={`comparison-summary summary-${summary.trend}`}>
          <div className="summary-content">
            <MdCompareArrows className="summary-icon" />
            <span className="summary-text">{summary.text}</span>
            <div className={`trend-indicator trend-${summary.trend}`}>
              {summary.trend === 'concerning' ? <MdTrendingUp /> : <MdTrendingDown />}
            </div>
          </div>
          <div className={`confidence-badge confidence-${summary.confidence}`}>
            {summary.confidence.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Comparison Categories */}
      <div className="comparison-categories">
        {/* Clinical Outcomes & Risk Factors */}
        {groupedComparisons.clinical?.length > 0 && (
          <ComparisonCategory
            title="Clinical Health"
            icon="🏥"
            comparisons={groupedComparisons.clinical}
            isExpanded={expandedCategories.clinical}
            onToggle={() => toggleCategory('clinical')}
            priority="high"
          />
        )}

        {/* Behavioral Risk Factors */}
        {groupedComparisons.behavioral?.length > 0 && (
          <ComparisonCategory
            title="Behavioral Factors"
            icon="🚶‍♂️"
            comparisons={groupedComparisons.behavioral}
            isExpanded={expandedCategories.behavioral}
            onToggle={() => toggleCategory('behavioral')}
            priority="medium"
          />
        )}

        {/* Social Determinants */}
        {groupedComparisons.social?.length > 0 && (
          <ComparisonCategory
            title="Social Environment"
            icon="🏘️"
            comparisons={groupedComparisons.social}
            isExpanded={expandedCategories.social}
            onToggle={() => toggleCategory('social')}
            priority="medium"
          />
        )}
      </div>

      {/* Footer Stats */}
      <div className="comparison-footer">
        <div className="footer-stats">
          <div className="stat">
            <span className="stat-value">
              {comparison.comparisons.filter(c => c.isWorse).length}
            </span>
            <span className="stat-label">worse metrics</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {comparison.comparisons.filter(c => !c.isWorse).length}
            </span>
            <span className="stat-label">better metrics</span>
          </div>
          <div className="stat">
            <span className="stat-value">{neighborhoodCount}</span>
            <span className="stat-label">neighbors</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Comparison Category Component
 */
const ComparisonCategory = ({ 
  title, 
  icon, 
  comparisons, 
  isExpanded, 
  onToggle, 
  priority = 'medium' 
}) => {
  const worseCount = comparisons.filter(c => c.isWorse).length;
  const betterCount = comparisons.filter(c => !c.isWorse).length;

  return (
    <div className={`comparison-category category-${priority}`}>
      <div className="category-header" onClick={onToggle}>
        <div className="category-title">
          <span className="category-icon">{icon}</span>
          <h4 className="category-name">{title}</h4>
          <div className="category-stats">
            {worseCount > 0 && (
              <span className="worse-count">↗ {worseCount}</span>
            )}
            {betterCount > 0 && (
              <span className="better-count">↘ {betterCount}</span>
            )}
          </div>
        </div>
        <div className="category-toggle">
          {isExpanded ? <MdExpandLess /> : <MdExpandMore />}
        </div>
      </div>

      {isExpanded && (
        <div className="category-content">
          <div className="comparisons-list">
            {comparisons.map((comparison, index) => (
              <ComparisonMetric 
                key={comparison.metricKey} 
                comparison={comparison}
                rank={index + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Individual Metric Comparison Component
 */
const ComparisonMetric = ({ comparison, rank }) => {
  const {
    label,
    targetValue,
    neighborhoodAverage,
    percentDifference,
    isWorse,
    significance
  } = comparison;

  const getPerformanceColor = (isWorse, significance) => {
    if (significance === 'high') {
      return isWorse ? '#dc2626' : '#22c55e';
    }
    return isWorse ? '#f59e0b' : '#3b82f6';
  };

  const formatValue = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const getSignificanceIcon = (significance) => {
    return significance === 'high' ? '⚠️' : 'ℹ️';
  };

  return (
    <div className={`comparison-metric metric-${significance}`}>
      <div className="metric-header">
        <div className="metric-info">
          <span className="metric-rank">#{rank}</span>
          <h5 className="metric-label">{label}</h5>
          <span className="significance-icon">
            {getSignificanceIcon(significance)}
          </span>
        </div>
        <div 
          className="performance-indicator"
          style={{ color: getPerformanceColor(isWorse, significance) }}
        >
          {isWorse ? <MdTrendingUp /> : <MdTrendingDown />}
          <span className="performance-value">
            {isWorse ? '+' : ''}{percentDifference.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="metric-comparison">
        <div className="value-comparison">
          <div className="target-value">
            <span className="value-label">This Area</span>
            <span className="value-number">{formatValue(targetValue)}</span>
          </div>
          <div className="comparison-arrow">
            <MdCompareArrows className="arrow-icon" />
          </div>
          <div className="neighborhood-value">
            <span className="value-label">Neighbors</span>
            <span className="value-number">{formatValue(neighborhoodAverage)}</span>
          </div>
        </div>
      </div>

      <div className="metric-interpretation">
        <span className={`interpretation-text interpretation-${isWorse ? 'worse' : 'better'}`}>
          {Math.abs(percentDifference).toFixed(1)}% {isWorse ? 'higher' : 'lower'} than neighboring areas
        </span>
      </div>
    </div>
  );
};

export default NeighborhoodComparison;
