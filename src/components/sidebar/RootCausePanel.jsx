import React, { useState, useEffect, useMemo } from 'react';
import { 
  MdTrendingUp, 
  MdWarning, 
  MdInfo, 
  MdCompareArrows, 
  MdRefresh,
  MdExpandMore,
  MdExpandLess
} from 'react-icons/md';
import { analyzeRootCauses, formatAnalysisForDisplay, HEALTH_METRICS } from '../../services/correlationAnalysis';

/**
 * Root Cause Analysis Panel Component
 * Implements instant "Why is this area high-risk?" analysis
 * Part of Layer 2: Correlation Insights Engine
 */
const RootCausePanel = ({ areaData, comparisonData, isLoading = false }) => {
  const [analysis, setAnalysis] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    primary: true,
    contributing: false,
    correlations: false,
    insights: true
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Memoize analysis to prevent unnecessary recalculations
  const rawAnalysis = useMemo(() => {
    if (!areaData || isLoading) return null;
    return analyzeRootCauses(areaData, comparisonData);
  }, [areaData, comparisonData, isLoading]);

  // Format analysis for display
  useEffect(() => {
    if (rawAnalysis) {
      setIsAnalyzing(true);
      // Simulate brief analysis time for UX
      const timer = setTimeout(() => {
        setAnalysis(formatAnalysisForDisplay(rawAnalysis));
        setIsAnalyzing(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setAnalysis(null);
      setIsAnalyzing(false);
    }
  }, [rawAnalysis]);

  // Toggle section expansion
  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Refresh analysis
  const refreshAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setAnalysis(formatAnalysisForDisplay(rawAnalysis));
      setIsAnalyzing(false);
    }, 1000);
  };

  if (isLoading || !areaData) {
    return (
      <div className="root-cause-panel loading">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="root-cause-panel analyzing">
        <div className="analyzing-header">
          <MdRefresh className="animate-spin text-blue-500" size={20} />
          <span className="analyzing-text">Analyzing risk factors...</span>
        </div>
        <div className="analyzing-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="root-cause-panel empty">
        <div className="empty-state">
          <MdInfo className="text-gray-400" size={24} />
          <p className="text-gray-600">Select an area to analyze risk factors</p>
        </div>
      </div>
    );
  }

  const { formattedFactors, formattedInsights, correlations, confidence } = analysis;

  return (
    <div className="root-cause-panel">
      {/* Panel Header */}
      <div className="panel-header">
        <div className="header-content">
          <h3 className="panel-title">Root Cause Analysis</h3>
          <div className="confidence-indicator">
            <span className={`confidence-badge confidence-${confidence}`}>
              {confidence.toUpperCase()} CONFIDENCE
            </span>
            <button 
              onClick={refreshAnalysis}
              className="refresh-button"
              title="Refresh Analysis"
            >
              <MdRefresh size={16} />
            </button>
          </div>
        </div>
        <p className="panel-subtitle">
          Understanding the drivers behind diabetes risk in this area
        </p>
      </div>

      {/* Key Insights Section */}
      {formattedInsights.length > 0 && (
        <div className="analysis-section insights-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('insights')}
          >
            <h4 className="section-title">
              💡 Key Insights
            </h4>
            {expandedSections.insights ? <MdExpandLess /> : <MdExpandMore />}
          </div>
          
          {expandedSections.insights && (
            <div className="insights-list">
              {formattedInsights.map((insight, index) => (
                <div 
                  key={index} 
                  className={`insight-card insight-${insight.priority}`}
                >
                  <div className="insight-header">
                    <span className="insight-icon">{insight.icon}</span>
                    <h5 className="insight-title">{insight.title}</h5>
                    {insight.urgency === 'urgent' && (
                      <MdWarning className="urgency-icon" />
                    )}
                  </div>
                  <p className="insight-description">{insight.description}</p>
                  {insight.actionable && (
                    <div className="insight-action">
                      <span className="action-label">
                        ⚡ Actionable insight
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Primary Risk Factors */}
      {formattedFactors.length > 0 && (
        <div className="analysis-section primary-factors-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('primary')}
          >
            <h4 className="section-title">
              🎯 Primary Risk Factors
            </h4>
            {expandedSections.primary ? <MdExpandLess /> : <MdExpandMore />}
          </div>
          
          {expandedSections.primary && (
            <div className="factors-list">
              {formattedFactors.map((factor, index) => (
                <FactorCard 
                  key={factor.metricKey} 
                  factor={factor} 
                  rank={index + 1}
                  showComparison={!!factor.comparison}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contributing Factors */}
      {analysis.contributingFactors?.length > 0 && (
        <div className="analysis-section contributing-factors-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('contributing')}
          >
            <h4 className="section-title">
              📊 Contributing Factors
            </h4>
            {expandedSections.contributing ? <MdExpandLess /> : <MdExpandMore />}
          </div>
          
          {expandedSections.contributing && (
            <div className="factors-list">
              {analysis.contributingFactors.map((factor, index) => (
                <FactorCard 
                  key={factor.metricKey} 
                  factor={factor} 
                  rank={index + 1}
                  variant="contributing"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Correlations */}
      {correlations.length > 0 && (
        <div className="analysis-section correlations-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('correlations')}
          >
            <h4 className="section-title">
              🔗 Factor Correlations
            </h4>
            {expandedSections.correlations ? <MdExpandLess /> : <MdExpandMore />}
          </div>
          
          {expandedSections.correlations && (
            <div className="correlations-list">
              {correlations.map((correlation, index) => (
                <CorrelationCard 
                  key={index} 
                  correlation={correlation}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Analysis Footer */}
      <div className="panel-footer">
        <div className="footer-stats">
          <span className="stat">
            {formattedFactors.length} primary factors
          </span>
          <span className="stat">
            {correlations.length} correlations
          </span>
          <span className="stat">
            {confidence} confidence
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Individual Factor Card Component
 */
const FactorCard = ({ factor, rank, variant = 'primary', showComparison = false }) => {
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

  return (
    <div className={`factor-card factor-${variant}`}>
      <div className="factor-header">
        <div className="factor-rank">#{rank}</div>
        <div className="factor-info">
          <h5 className="factor-label">{factor.label}</h5>
          <span className="factor-category">{factor.category}</span>
        </div>
        <div className="factor-value">
          <span 
            className="value-display"
            style={{ color: getRiskColor(factor.severity) }}
          >
            {factor.displayValue}
          </span>
          <span className="priority-icon">
            {getPriorityIcon(factor.actionPriority)}
          </span>
        </div>
      </div>
      
      <p className="factor-description">{factor.description}</p>
      
      {showComparison && factor.comparison && (
        <div className="factor-comparison">
          <MdCompareArrows className="comparison-icon" />
          <span className="comparison-text">
            {factor.comparison.isHigher ? '+' : ''}
            {factor.comparison.percentDifference.toFixed(1)}% vs. reference
          </span>
        </div>
      )}
      
      <div className="factor-indicators">
        <div className={`severity-indicator severity-${factor.severity}`}>
          {factor.severity.toUpperCase()}
        </div>
        <div className={`impact-indicator impact-${factor.impact}`}>
          {factor.impact.toUpperCase()} IMPACT
        </div>
      </div>
    </div>
  );
};

/**
 * Correlation Card Component
 */
const CorrelationCard = ({ correlation }) => {
  const getCorrelationStrength = (strength) => {
    if (strength >= 0.8) return 'Very Strong';
    if (strength >= 0.6) return 'Strong';
    if (strength >= 0.4) return 'Moderate';
    return 'Weak';
  };

  const getCorrelationColor = (strength) => {
    if (strength >= 0.8) return '#dc2626';
    if (strength >= 0.6) return '#f59e0b';
    if (strength >= 0.4) return '#3b82f6';
    return '#6b7280';
  };

  // Find metric configurations
  const findMetricConfig = (metricKey) => {
    for (const category of Object.values(HEALTH_METRICS)) {
      if (category[metricKey]) return category[metricKey];
    }
    return { label: metricKey };
  };

  const metric1Config = findMetricConfig(correlation.metric1);
  const metric2Config = findMetricConfig(correlation.metric2);

  return (
    <div className="correlation-card">
      <div className="correlation-header">
        <MdTrendingUp 
          className="correlation-icon" 
          style={{ color: getCorrelationColor(correlation.strength) }}
        />
        <div className="correlation-strength">
          <span className="strength-label">
            {getCorrelationStrength(correlation.strength)}
          </span>
          <span className="strength-value">
            {(correlation.strength * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      
      <div className="correlation-metrics">
        <div className="metric-pair">
          <span className="metric-name">{metric1Config.label}</span>
          <span className="metric-connector">↔</span>
          <span className="metric-name">{metric2Config.label}</span>
        </div>
      </div>
      
      <p className="correlation-description">
        These factors show a {correlation.type} relationship, 
        suggesting {correlation.confidence} confidence in their connection.
      </p>
    </div>
  );
};

export default RootCausePanel;
