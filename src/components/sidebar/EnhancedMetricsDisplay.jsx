import React, { useState } from 'react';
import { MdExpandMore, MdExpandLess, MdPeople, MdLocationCity, MdLocalHospital, MdPsychology } from 'react-icons/md';

const MetricSection = ({ title, icon: Icon, metrics, defaultExpanded = false, priority = 'normal' }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const toggleExpanded = () => setIsExpanded(!isExpanded);
  
  // Filter out undefined/null metrics
  const validMetrics = Object.entries(metrics).filter(([key, value]) => value !== undefined && value !== 'N/A');
  
  if (validMetrics.length === 0) return null;
  
  return (
    <div className={`metric-section priority-${priority}`}>
      <button 
        className="metric-section-header" 
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
      >
        <div className="header-content">
          <Icon className="section-icon" />
          <span className="section-title">{title}</span>
          <span className="metric-count">({validMetrics.length})</span>
        </div>
        {isExpanded ? <MdExpandLess /> : <MdExpandMore />}
      </button>
      
      {isExpanded && (
        <div className="metric-section-content">
          <div className="metrics-grid">
            {validMetrics.map(([key, value]) => (
              <div key={key} className="metric-item">
                <span className="metric-label">{getMetricLabel(key)}</span>
                <span className="metric-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const getMetricLabel = (key) => {
  const labels = {
    // Population Demographics
    totalPopulation: 'Total Population',
    adultPopulation: 'Adult Population (18+)',
    
    // Core Health Metrics
    diabetes: 'Diabetes Prevalence',
    obesity: 'Obesity Rate',
    hypertension: 'Hypertension Rate',
    physicalActivity: 'Physical Inactivity',
    smoking: 'Current Smoking',
    
    // Social Determinants
    depression: 'Depression',
    socialIsolation: 'Social Isolation',
    housingInsecurity: 'Housing Insecurity',
    transportationBarriers: 'Lack of Transportation',
    foodInsecurity: 'Food Insecurity',
    foodStampUsage: 'Food Assistance Usage',
    
    // Healthcare Access & Behaviors
    healthcareAccess: 'No Healthcare Access',
    routineCheckup: 'Annual Checkup',
    dentalVisit: 'Dental Visit',
    
    // Health Outcomes
    generalHealth: 'Fair/Poor Health',
    mentalHealth: 'Poor Mental Health',
    physicalHealth: 'Poor Physical Health',
    sleepDuration: 'Insufficient Sleep'
  };
  
  return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

const EnhancedMetricsDisplay = ({ keyMetrics }) => {
  if (!keyMetrics) return null;
  
  // Organize metrics by category - REMOVED core health metrics to prevent redundancy
  const demographics = {
    totalPopulation: keyMetrics.totalPopulation,
    adultPopulation: keyMetrics.adultPopulation
  };
  
  // REMOVED: coreHealthMetrics - now displayed in main Key Health Indicators section
  
  const socialDeterminants = {
    depression: keyMetrics.depression
    // REMOVED: socialIsolation, housingInsecurity, transportationBarriers, foodInsecurity, foodStampUsage
    // These metrics consistently show "No Data" and don't provide value to public health planners
  };
  
  const healthcareAccess = {
    // REMOVED: healthcareAccess - now in main section
    routineCheckup: keyMetrics.routineCheckup,
    dentalVisit: keyMetrics.dentalVisit
  };
  
  const additionalHealthMetrics = {
    // ADDED: Include smoking here as additional context (removed from core)
    smoking: keyMetrics.smoking,
    generalHealth: keyMetrics.generalHealth,
    mentalHealth: keyMetrics.mentalHealth,
    physicalHealth: keyMetrics.physicalHealth,
    sleepDuration: keyMetrics.sleepDuration
  };
  
  return (
    <div className="enhanced-metrics-display">
      <div className="metrics-header">
        <h3>Additional Health Context</h3>
        <p className="metrics-subtitle">Supporting data for comprehensive analysis</p>
      </div>
      
      <div className="metrics-sections">
        <MetricSection 
          title="Population Demographics" 
          icon={MdPeople} 
          metrics={demographics}
          defaultExpanded={false}
          priority="medium"
        />
        
        <MetricSection 
          title="Social Determinants" 
          icon={MdLocationCity} 
          metrics={socialDeterminants}
          defaultExpanded={false}
          priority="medium"
        />
        
        <MetricSection 
          title="Healthcare Access & Behaviors" 
          icon={MdLocalHospital} 
          metrics={healthcareAccess}
          defaultExpanded={false}
          priority="medium"
        />
        
        <MetricSection 
          title="Additional Health Outcomes" 
          icon={MdPsychology} 
          metrics={additionalHealthMetrics}
          defaultExpanded={false}
          priority="low"
        />
      </div>
    </div>
  );
};

export default EnhancedMetricsDisplay;
