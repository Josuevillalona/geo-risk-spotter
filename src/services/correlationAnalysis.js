// Correlation Analysis Service for RiskPulse: Diabetes
// Implements instant "Why is this area high-risk?" analysis
// Layer 2: Correlation Insights Engine

/**
 * Health Metrics Configuration
 * Based on CDC diabetes risk factors and social determinants of health
 */
export const HEALTH_METRICS = {
  primary: {
    diabetes: { 
      label: 'Diabetes Rate', 
      unit: '%', 
      high: 12, 
      critical: 15,
      description: 'Age-adjusted diabetes prevalence',
      category: 'Clinical Outcomes'
    },
    obesity: { 
      label: 'Obesity Rate', 
      unit: '%', 
      high: 30, 
      critical: 35,
      description: 'Body Mass Index ≥30',
      category: 'Clinical Risk Factors'
    },
    hypertension: { 
      label: 'Hypertension Rate', 
      unit: '%', 
      high: 35, 
      critical: 45,
      description: 'High blood pressure prevalence',
      category: 'Clinical Risk Factors'
    }
  },
  behavioral: {
    physicalActivity: { 
      label: 'Physical Inactivity', 
      unit: '%', 
      high: 25, 
      critical: 35,
      description: 'No leisure-time physical activity',
      category: 'Behavioral Risk Factors'
    },
    smoking: { 
      label: 'Smoking Rate', 
      unit: '%', 
      high: 15, 
      critical: 20,
      description: 'Current smoking prevalence',
      category: 'Behavioral Risk Factors'
    }
  },
  social: {
    foodInsecurity: { 
      label: 'Food Insecurity', 
      unit: '%', 
      high: 15, 
      critical: 25,
      description: 'Limited access to nutritious food',
      category: 'Social Determinants'
    },
    poverty: { 
      label: 'Poverty Rate', 
      unit: '%', 
      high: 20, 
      critical: 30,
      description: 'Below federal poverty level',
      category: 'Social Determinants'
    },
    healthcare: { 
      label: 'Healthcare Access', 
      unit: '%', 
      high: 15, 
      critical: 25,
      description: 'Limited healthcare access',
      category: 'Social Determinants'
    }
  }
};

/**
 * Risk Level Classifications
 */
export const RISK_LEVELS = {
  low: { label: 'Low Risk', color: '#22c55e', threshold: 0.3 },
  moderate: { label: 'Moderate Risk', color: '#f59e0b', threshold: 0.6 },
  high: { label: 'High Risk', color: '#ef4444', threshold: 0.8 },
  critical: { label: 'Critical Risk', color: '#dc2626', threshold: 1.0 }
};

/**
 * Calculate correlation strength between two metrics
 * @param {number} metric1 - First metric value
 * @param {number} metric2 - Second metric value
 * @param {string} metric1Key - First metric key for thresholds
 * @param {string} metric2Key - Second metric key for thresholds
 * @returns {Object} Correlation analysis result
 */
export const calculateCorrelation = (metric1, metric2, metric1Key, metric2Key) => {
  // Normalize metrics to 0-1 scale based on thresholds
  const normalizeMetric = (value, metricKey) => {
    const metricConfig = findMetricConfig(metricKey);
    if (!metricConfig) return 0.5;
    
    const { high, critical } = metricConfig;
    if (value >= critical) return 1.0;
    if (value >= high) return 0.7;
    if (value >= high * 0.5) return 0.4;
    return 0.2;
  };

  const norm1 = normalizeMetric(metric1, metric1Key);
  const norm2 = normalizeMetric(metric2, metric2Key);

  // Simple correlation calculation (both high = strong positive correlation)
  const correlation = Math.abs(norm1 - norm2) < 0.3 ? 
    Math.min(norm1, norm2) : 
    Math.abs(norm1 - norm2) * 0.5;

  return {
    strength: correlation,
    type: norm1 > 0.6 && norm2 > 0.6 ? 'reinforcing' : 'moderate',
    confidence: correlation > 0.7 ? 'high' : correlation > 0.4 ? 'medium' : 'low'
  };
};

/**
 * Find metric configuration by key
 */
const findMetricConfig = (metricKey) => {
  for (const category of Object.values(HEALTH_METRICS)) {
    if (category[metricKey]) return category[metricKey];
  }
  return null;
};

/**
 * Generate root cause analysis for an area
 * @param {Object} areaData - Health metrics data for the area
 * @param {Object} comparisonData - Optional comparison data (borough/city average)
 * @returns {Object} Root cause analysis result
 */
export const analyzeRootCauses = (areaData, comparisonData = null) => {
  if (!areaData) return null;

  // Extract and normalize metric values
  const metrics = extractMetrics(areaData);
  const primaryFactors = [];
  const contributingFactors = [];
  const protectiveFactors = [];

  // Analyze each metric category
  Object.entries(HEALTH_METRICS).forEach(([categoryKey, categoryMetrics]) => {
    Object.entries(categoryMetrics).forEach(([metricKey, config]) => {
      const value = metrics[metricKey];
      if (value === null || value === undefined) return;

      const factor = analyzeMetricImpact(metricKey, value, config, comparisonData);
      if (factor) {
        if (factor.impact === 'high') primaryFactors.push(factor);
        else if (factor.impact === 'moderate') contributingFactors.push(factor);
        else if (factor.impact === 'protective') protectiveFactors.push(factor);
      }
    });
  });

  // Find correlations between factors
  const correlations = findStrongestCorrelations(metrics);

  // Generate narrative insights
  const insights = generateInsights(primaryFactors, contributingFactors, correlations);

  return {
    primaryFactors: primaryFactors.slice(0, 3), // Top 3 primary factors
    contributingFactors: contributingFactors.slice(0, 5), // Top 5 contributing factors
    protectiveFactors: protectiveFactors.slice(0, 3), // Top 3 protective factors
    correlations: correlations.slice(0, 3), // Top 3 correlations
    insights,
    confidence: calculateOverallConfidence(primaryFactors, correlations)
  };
};

/**
 * Extract standardized metrics from area data
 */
const extractMetrics = (areaData) => {
  return {
    diabetes: parseFloat(areaData.DIABETES_CrudePrev || areaData.diabetes_avg || 0),
    obesity: parseFloat(areaData.OBESITY_CrudePrev || areaData.obesity_avg || 0),
    hypertension: parseFloat(areaData.BPHIGH_CrudePrev || areaData.hypertension_avg || 0),
    physicalActivity: parseFloat(areaData.LPA_CrudePrev || areaData.physical_inactivity_avg || 0),
    smoking: parseFloat(areaData.CSMOKING_CrudePrev || areaData.smoking_avg || 0),
    foodInsecurity: parseFloat(areaData.food_insecurity_avg || 0),
    poverty: parseFloat(areaData.poverty_rate || 0),
    healthcare: parseFloat(areaData.healthcare_access || 0)
  };
};

/**
 * Analyze individual metric impact
 */
const analyzeMetricImpact = (metricKey, value, config, comparisonData) => {
  if (value === null || value === undefined) return null;

  const { high, critical, label, category, description } = config;
  
  let impact = 'low';
  let severity = 'normal';

  if (value >= critical) {
    impact = 'high';
    severity = 'critical';
  } else if (value >= high) {
    impact = 'moderate';
    severity = 'elevated';
  } else if (value < high * 0.5) {
    impact = 'protective';
    severity = 'low';
  }

  // Compare to reference data if available
  let comparison = null;
  if (comparisonData && comparisonData[metricKey]) {
    const compValue = parseFloat(comparisonData[metricKey]);
    const diff = value - compValue;
    const percentDiff = (diff / compValue) * 100;
    
    comparison = {
      referenceValue: compValue,
      difference: diff,
      percentDifference: percentDiff,
      isHigher: diff > 0,
      significance: Math.abs(percentDiff) > 20 ? 'significant' : 'moderate'
    };
  }

  return {
    metricKey,
    label,
    value,
    category,
    description,
    impact,
    severity,
    comparison,
    confidence: comparison ? 'high' : 'medium'
  };
};

/**
 * Find strongest correlations between metrics
 */
const findStrongestCorrelations = (metrics) => {
  const correlations = [];
  const metricKeys = Object.keys(metrics);

  for (let i = 0; i < metricKeys.length; i++) {
    for (let j = i + 1; j < metricKeys.length; j++) {
      const key1 = metricKeys[i];
      const key2 = metricKeys[j];
      const value1 = metrics[key1];
      const value2 = metrics[key2];

      if (value1 !== null && value2 !== null) {
        const correlation = calculateCorrelation(value1, value2, key1, key2);
        if (correlation.strength > 0.5) {
          correlations.push({
            metric1: key1,
            metric2: key2,
            value1,
            value2,
            ...correlation
          });
        }
      }
    }
  }

  return correlations.sort((a, b) => b.strength - a.strength);
};

/**
 * Generate narrative insights from analysis
 */
const generateInsights = (primaryFactors, contributingFactors, correlations) => {
  const insights = [];

  // Primary driver insight
  if (primaryFactors.length > 0) {
    const topFactor = primaryFactors[0];
    insights.push({
      type: 'primary_driver',
      title: `${topFactor.label} is the Primary Risk Driver`,
      description: `At ${topFactor.value.toFixed(1)}%, this area's ${topFactor.label.toLowerCase()} rate is ${topFactor.severity === 'critical' ? 'critically' : 'significantly'} elevated.`,
      actionable: true,
      priority: 'high'
    });
  }

  // Correlation insight
  if (correlations.length > 0) {
    const topCorr = correlations[0];
    const config1 = findMetricConfig(topCorr.metric1);
    const config2 = findMetricConfig(topCorr.metric2);
    
    insights.push({
      type: 'correlation',
      title: `${config1?.label} and ${config2?.label} Are Reinforcing Each Other`,
      description: `These two factors show a strong correlation (${(topCorr.strength * 100).toFixed(0)}% confidence), suggesting they may share common root causes.`,
      actionable: true,
      priority: 'medium'
    });
  }

  // Multi-factor insight
  if (primaryFactors.length >= 2) {
    insights.push({
      type: 'multi_factor',
      title: 'Multiple Risk Factors Present',
      description: `This area shows elevated levels across ${primaryFactors.length} primary risk factors, indicating systemic health challenges.`,
      actionable: true,
      priority: 'high'
    });
  }

  return insights;
};

/**
 * Calculate overall confidence in the analysis
 */
const calculateOverallConfidence = (primaryFactors, correlations) => {
  const factorConfidence = primaryFactors.reduce((acc, factor) => {
    return acc + (factor.confidence === 'high' ? 1 : 0.5);
  }, 0) / Math.max(primaryFactors.length, 1);

  const corrConfidence = correlations.reduce((acc, corr) => {
    return acc + (corr.confidence === 'high' ? 1 : 0.5);
  }, 0) / Math.max(correlations.length, 1);

  const overall = (factorConfidence + corrConfidence) / 2;
  
  if (overall >= 0.8) return 'high';
  if (overall >= 0.6) return 'medium';
  return 'low';
};

/**
 * Generate neighborhood comparison insights
 * @param {Object} targetArea - The area being analyzed
 * @param {Array} neighborhoodAreas - Array of nearby areas for comparison
 * @returns {Object} Comparison analysis
 */
export const generateNeighborhoodComparison = (targetArea, neighborhoodAreas = []) => {
  if (!targetArea || !neighborhoodAreas.length) return null;

  const targetMetrics = extractMetrics(targetArea);
  const comparisons = [];

  // Calculate averages for comparison areas
  const avgMetrics = {};
  Object.keys(targetMetrics).forEach(key => {
    const values = neighborhoodAreas
      .map(area => extractMetrics(area)[key])
      .filter(val => val !== null && val !== undefined && !isNaN(val));
    
    avgMetrics[key] = values.length > 0 ? 
      values.reduce((sum, val) => sum + val, 0) / values.length : null;
  });

  // Compare each metric
  Object.entries(targetMetrics).forEach(([metricKey, targetValue]) => {
    const avgValue = avgMetrics[metricKey];
    if (targetValue !== null && avgValue !== null) {
      const difference = targetValue - avgValue;
      const percentDiff = (difference / avgValue) * 100;
      const config = findMetricConfig(metricKey);

      if (config && Math.abs(percentDiff) > 10) { // Only include meaningful differences
        comparisons.push({
          metricKey,
          label: config.label,
          targetValue,
          neighborhoodAverage: avgValue,
          difference,
          percentDifference: percentDiff,
          isWorse: difference > 0,
          significance: Math.abs(percentDiff) > 25 ? 'high' : 'moderate',
          category: config.category
        });
      }
    }
  });

  // Sort by significance
  comparisons.sort((a, b) => Math.abs(b.percentDifference) - Math.abs(a.percentDifference));

  return {
    comparisons: comparisons.slice(0, 5), // Top 5 differences
    summary: generateComparisonSummary(comparisons),
    neighborhoodCount: neighborhoodAreas.length
  };
};

/**
 * Generate comparison summary insights
 */
const generateComparisonSummary = (comparisons) => {
  const worseMetrics = comparisons.filter(c => c.isWorse);
  const betterMetrics = comparisons.filter(c => !c.isWorse);

  let summary = '';
  
  if (worseMetrics.length > betterMetrics.length) {
    summary = `This area performs worse than neighboring areas in ${worseMetrics.length} key metrics`;
  } else if (betterMetrics.length > worseMetrics.length) {
    summary = `This area performs better than neighboring areas in ${betterMetrics.length} key metrics`;
  } else {
    summary = 'This area shows mixed performance compared to neighboring areas';
  }

  return {
    text: summary,
    trend: worseMetrics.length > betterMetrics.length ? 'concerning' : 'positive',
    confidence: comparisons.length >= 3 ? 'high' : 'medium'
  };
};

/**
 * Format analysis results for display
 */
export const formatAnalysisForDisplay = (analysis) => {
  if (!analysis) return null;

  return {
    ...analysis,
    formattedFactors: analysis.primaryFactors.map(factor => ({
      ...factor,
      displayValue: `${factor.value.toFixed(1)}%`,
      riskLevel: factor.severity,
      actionPriority: factor.impact === 'high' ? 'immediate' : 'planned'
    })),
    formattedInsights: analysis.insights.map(insight => ({
      ...insight,
      icon: getInsightIcon(insight.type),
      urgency: insight.priority === 'high' ? 'urgent' : 'normal'
    }))
  };
};

/**
 * Get icon for insight type
 */
const getInsightIcon = (type) => {
  const icons = {
    primary_driver: '🎯',
    correlation: '🔗',
    multi_factor: '⚠️',
    comparison: '📊',
    trend: '📈'
  };
  return icons[type] || '💡';
};
