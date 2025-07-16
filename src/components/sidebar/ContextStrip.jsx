import React from 'react';
import { MdLocationOn, MdPeople, MdCompareArrows, MdTrendingUp, MdError } from 'react-icons/md';
import { useAppStore } from '../../store';

const LocationContext = ({ data }) => {
  if (!data) return null;
  
  const getLocationInfo = () => {
    switch (data.type) {
      case 'borough':
        return {
          icon: <MdLocationOn className="context-icon text-blue-500" />,
          primary: data.name,
          secondary: 'Borough View',
          badge: 'OVERVIEW'
        };
      case 'zipcode':
        return {
          icon: <MdLocationOn className="context-icon text-green-500" />,
          primary: `ZIP ${data.name}`,
          secondary: data.data?.borough || 'New York',
          badge: 'DETAILED'
        };
      case 'borough-summary':
        return {
          icon: <MdLocationOn className="context-icon text-purple-500" />,
          primary: data.name,
          secondary: 'Borough Filter Active',
          badge: 'FILTERED'
        };
      default:
        return null;
    }
  };
  
  const locationInfo = getLocationInfo();
  if (!locationInfo) return null;
  
  return (
    <div className="context-item location-context">
      <div className="context-icon-wrapper">
        {locationInfo.icon}
        <span className="context-badge">{locationInfo.badge}</span>
      </div>
      <div className="context-text">
        <span className="context-primary">{locationInfo.primary}</span>
        <span className="context-secondary">{locationInfo.secondary}</span>
      </div>
    </div>
  );
};

const PopulationContext = ({ data }) => {
  const { selectedBorough, boroughData } = useAppStore();
  
  if (!data?.data) return null;
  
  const getPopulationInfo = () => {
    if (data.type === 'borough' || data.type === 'borough-summary') {
      // Get zip count for borough from boroughData object
      const boroughInfo = boroughData?.[data.name];
      const zipCount = boroughInfo?.zipCodeCount || boroughInfo?.zipCodes?.length || 0;
      
      return {
        value: zipCount,
        label: zipCount === 1 ? 'ZIP Code' : 'ZIP Codes',
        icon: 'zip',
        color: 'text-blue-500'
      };
    } else {
      // Individual zip code population (if available)
      const population = data.data.population;
      if (population) {
        return {
          value: formatNumber(population),
          label: 'Population',
          icon: 'people',
          color: 'text-green-500'
        };
      }
      // Fallback to basic zip info
      return {
        value: '1',
        label: 'ZIP Code',
        icon: 'zip',
        color: 'text-green-500'
      };
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  const popInfo = getPopulationInfo();
  
  return (
    <div className="context-item population-context">
      <div className="context-icon-wrapper">
        {popInfo.icon === 'people' ? (
          <MdPeople className={`context-icon ${popInfo.color}`} />
        ) : (
          <MdLocationOn className={`context-icon ${popInfo.color}`} />
        )}
      </div>
      <div className="context-text">
        <span className="context-primary">{popInfo.value}</span>
        <span className="context-secondary">{popInfo.label}</span>
      </div>
    </div>
  );
};

const RiskContext = ({ data }) => {
  if (!data?.data) return null;
  
  const riskScore = data.data.risk_score || data.data.riskScore;
  if (!riskScore || riskScore === 'N/A') return null;
  
  const getRiskLevel = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 70) return { level: 'High', color: 'text-red-500', bg: 'bg-red-50' };
    if (numScore >= 50) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'Low', color: 'text-green-600', bg: 'bg-green-50' };
  };
  
  const riskInfo = getRiskLevel(riskScore);
  
  return (
    <div className="context-item risk-context">
      <div className="context-icon-wrapper">
        <MdTrendingUp className={`context-icon ${riskInfo.color}`} />
      </div>
      <div className="context-text">
        <span className="context-primary">{parseFloat(riskScore).toFixed(1)}</span>
        <span className="context-secondary">Risk Score</span>
      </div>
      <div className={`risk-level-badge ${riskInfo.bg} ${riskInfo.color}`}>
        {riskInfo.level}
      </div>
    </div>
  );
};

const ComparisonContext = ({ data }) => {
  const { selectedBorough, boroughData } = useAppStore();
  
  if (!data?.data) return null;
  
  // Enhanced context for different view modes
  const getComparisonInfo = () => {
    if (data.type === 'borough-summary' && selectedBorough !== 'All') {
      return {
        icon: <MdCompareArrows className="context-icon text-purple-500" />,
        primary: 'Borough Filter',
        secondary: `${selectedBorough} only`,
        badge: 'ACTIVE'
      };
    } else if (data.type === 'zipcode' && data.data?.borough) {
      return {
        icon: <MdCompareArrows className="context-icon text-blue-500" />,
        primary: 'vs. Borough',
        secondary: `Compare to ${data.data.borough}`,
        badge: 'AVAILABLE'
      };
    } else {
      return {
        icon: <MdCompareArrows className="context-icon text-gray-400" />,
        primary: 'Comparison',
        secondary: 'Select area to compare',
        badge: 'PENDING'
      };
    }
  };
  
  const compInfo = getComparisonInfo();
  
  return (
    <div className="context-item comparison-context">
      <div className="context-icon-wrapper">
        {compInfo.icon}
        <span className="context-badge">{compInfo.badge}</span>
      </div>
      <div className="context-text">
        <span className="context-primary">{compInfo.primary}</span>
        <span className="context-secondary">{compInfo.secondary}</span>
      </div>
    </div>
  );
};

const ContextStrip = ({ displayData, comparisons }) => {
  const { selectedBorough, viewMode } = useAppStore();
  
  if (!displayData) {
    return (
      <div className="context-strip">
        <div className="context-item context-empty">
          <div className="context-icon-wrapper">
            <MdError className="context-icon text-gray-400" />
          </div>
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
      {/* Always show location context */}
      <LocationContext data={displayData} />
      
      {/* Show population/zip count info */}
      <PopulationContext data={displayData} />
      
      {/* Show risk score if available */}
      <RiskContext data={displayData} />
      
      {/* Show comparison/filter status */}
      <ComparisonContext data={displayData} />
    </div>
  );
};

export default ContextStrip;
