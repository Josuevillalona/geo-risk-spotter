import React from 'react';
import { MdLocationOn, MdPeople, MdCompareArrows } from 'react-icons/md';

const LocationContext = ({ data }) => {
  if (!data) return null;
  
  const getLocationInfo = () => {
    switch (data.type) {
      case 'borough':
        return {
          icon: <MdLocationOn className="context-icon" />,
          primary: data.name,
          secondary: 'Borough'
        };
      case 'zipcode':
        return {
          icon: <MdLocationOn className="context-icon" />,
          primary: `ZIP ${data.name}`,
          secondary: 'New York'
        };
      case 'borough-summary':
        return {
          icon: <MdLocationOn className="context-icon" />,
          primary: data.name,
          secondary: 'Borough Summary'
        };
      default:
        return null;
    }
  };
  
  const locationInfo = getLocationInfo();
  if (!locationInfo) return null;
  
  return (
    <div className="context-item location-context">
      {locationInfo.icon}
      <div className="context-text">
        <span className="context-primary">{locationInfo.primary}</span>
        <span className="context-secondary">{locationInfo.secondary}</span>
      </div>
    </div>
  );
};

const PopulationContext = ({ data }) => {
  if (!data?.data) return null;
  
  // Extract population data if available
  const population = data.data.population || data.data.zipCodeCount;
  
  if (!population) return null;
  
  const formatPopulation = (pop) => {
    if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
    if (pop >= 1000) return `${(pop / 1000).toFixed(1)}K`;
    return pop.toString();
  };
  
  const getPopulationLabel = () => {
    if (data.type === 'borough' || data.type === 'borough-summary') {
      return 'ZIP Codes';
    }
    return 'Population';
  };
  
  return (
    <div className="context-item population-context">
      <MdPeople className="context-icon" />
      <div className="context-text">
        <span className="context-primary">{formatPopulation(population)}</span>
        <span className="context-secondary">{getPopulationLabel()}</span>
      </div>
    </div>
  );
};

const ComparisonIndicator = ({ value, baseline, label }) => {
  if (!value || !baseline || value === 'N/A') return null;
  
  const numValue = parseFloat(value);
  const numBaseline = parseFloat(baseline);
  
  if (isNaN(numValue) || isNaN(numBaseline)) return null;
  
  const ratio = numValue / numBaseline;
  const percentDiff = ((ratio - 1) * 100);
  
  const getComparisonClass = () => {
    if (ratio > 1.2) return 'comparison-high';
    if (ratio > 1.1) return 'comparison-moderate';
    if (ratio < 0.8) return 'comparison-low';
    return 'comparison-neutral';
  };
  
  const getComparisonText = () => {
    if (Math.abs(percentDiff) < 5) return 'Similar';
    const direction = percentDiff > 0 ? 'higher' : 'lower';
    return `${Math.abs(percentDiff).toFixed(0)}% ${direction}`;
  };
  
  return (
    <div className={`comparison-indicator ${getComparisonClass()}`}>
      <span className="comparison-value">{getComparisonText()}</span>
      <span className="comparison-label">{label}</span>
    </div>
  );
};

const ComparisonContext = ({ data }) => {
  if (!data?.data) return null;
  
  // For now, we'll show a placeholder since we don't have comparison data yet
  // This will be enhanced in Layer 2 with actual comparison calculations
  
  return (
    <div className="context-item comparison-context">
      <MdCompareArrows className="context-icon" />
      <div className="context-text">
        <span className="context-primary">vs. County</span>
        <span className="context-secondary">Comparison available in analysis</span>
      </div>
    </div>
  );
};

const ContextStrip = ({ displayData, comparisons }) => {
  if (!displayData) {
    return (
      <div className="context-strip">
        <div className="context-item">
          <MdLocationOn className="context-icon" />
          <div className="context-text">
            <span className="context-primary">Select an area</span>
            <span className="context-secondary">to view health data</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="context-strip">
      {/* Only show location context for borough types, skip for zipcode since it's shown in HeroMetrics */}
      {(displayData.type === 'borough' || displayData.type === 'borough-summary') && (
        <LocationContext data={displayData} />
      )}
      <PopulationContext data={displayData} />
    </div>
  );
};

export default ContextStrip;
