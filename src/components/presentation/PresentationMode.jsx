import React, { useState, useEffect, useMemo } from 'react';
import { 
  MdFullscreen, 
  MdFullscreenExit,
  MdPictureAsPdf,
  MdShare,
  MdPrint,
  MdVisibility,
  MdClose,
  MdSlideshow,
  MdDownload,
  MdLink
} from 'react-icons/md';
import { useAppStore } from '../../store';
import { analyzeRootCauses } from '../../services/correlationAnalysis';

/**
 * Presentation Mode Component
 * Professional stakeholder presentation interface
 * Part of Layer 3: Evidence Package Builder
 */
const PresentationMode = ({ 
  areaData, 
  isVisible = false, 
  onClose,
  presentationTitle = "Diabetes Risk Analysis Presentation"
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [shareableLink, setShareableLink] = useState(null);

  // Get data from store
  const { selectedArea, aiSummary } = useAppStore();

  // Generate presentation data
  const presentationData = useMemo(() => {
    if (!areaData) return null;

    const analysis = analyzeRootCauses(areaData);
    
    // Create a more descriptive area name
    const zipCode = selectedArea?.properties?.zip_code;
    const borough = selectedArea?.properties?.borough || selectedArea?.properties?.BOROUGH;
    const neighborhood = selectedArea?.properties?.neighborhood || selectedArea?.properties?.NEIGHBORHOOD;
    
    let areaName = 'Geographic Area';
    if (zipCode) {
      if (neighborhood && borough) {
        areaName = `${neighborhood}, ${borough} (${zipCode})`;
      } else if (borough) {
        areaName = `${borough} ZIP ${zipCode}`;
      } else {
        areaName = `ZIP Code ${zipCode}`;
      }
    } else if (neighborhood && borough) {
      areaName = `${neighborhood}, ${borough}`;
    } else if (borough) {
      areaName = borough;
    }
    
    return {
      title: `Diabetes Risk Analysis: ${areaName}`,
      subtitle: `Evidence-Based Health Assessment for Public Health Planning`,
      areaName,
      analysis,
      timestamp: new Date().toLocaleDateString(),
      metrics: extractKeyMetrics(areaData),
      summary: aiSummary || 'AI analysis not available'
    };
  }, [areaData, selectedArea, aiSummary]);

  // Define presentation slides
  const slides = useMemo(() => {
    if (!presentationData) return [];

    return [
      {
        id: 'title',
        type: 'title',
        title: presentationData.title,
        subtitle: presentationData.subtitle,
        metadata: {
          date: presentationData.timestamp,
          area: presentationData.areaName,
          source: 'RiskPulse: Diabetes Risk Analytics Platform'
        }
      },
      {
        id: 'executive-summary',
        type: 'executive-summary',
        title: 'Executive Summary',
        content: {
          riskLevel: calculateRiskLevel(presentationData.metrics),
          keyFindings: generateKeyFindings(presentationData.analysis),
          recommendations: generateExecutiveRecommendations(presentationData.analysis),
          urgency: assessUrgencyLevel(presentationData.analysis)
        }
      },
      {
        id: 'risk-overview',
        type: 'risk-overview',
        title: 'Risk Profile Overview',
        content: {
          metrics: presentationData.metrics,
          riskScore: presentationData.metrics.riskScore,
          primaryConcerns: presentationData.analysis?.primaryFactors || [],
          comparison: 'vs. NYC Average' // Could be enhanced with actual comparison data
        }
      },
      {
        id: 'root-cause-analysis',
        type: 'root-cause',
        title: 'Root Cause Analysis',
        content: {
          primaryFactors: presentationData.analysis?.primaryFactors || [],
          correlations: presentationData.analysis?.correlations || [],
          insights: presentationData.analysis?.insights || [],
          confidence: presentationData.analysis?.confidence || 'medium'
        }
      },
      {
        id: 'action-plan',
        type: 'action-plan',
        title: 'Recommended Action Plan',
        content: {
          immediateActions: generateImmediateActions(presentationData.analysis),
          mediumTermActions: generateMediumTermActions(presentationData.analysis),
          longTermActions: generateLongTermActions(presentationData.analysis),
          timeline: generateTimeline(presentationData.analysis)
        }
      },
      {
        id: 'evidence-summary',
        type: 'evidence',
        title: 'Supporting Evidence',
        content: {
          dataSource: 'NYC Department of Health and Mental Hygiene',
          methodology: 'AI-powered correlation analysis with CDC risk factors',
          confidenceLevel: presentationData.analysis?.confidence || 'medium',
          limitations: [
            'Analysis based on available public health data',
            'Recommendations require local context validation',
            'Implementation should involve community stakeholders'
          ]
        }
      }
    ];
  }, [presentationData]);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Handle slide navigation
  const nextSlide = () => {
    setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  const goToSlide = (index) => {
    setCurrentSlide(Math.max(0, Math.min(index, slides.length - 1)));
  };

  // Handle export functionality
  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      // This would integrate with a PDF generation service
      // For now, we'll simulate the process
      await simulatePDFGeneration();
      
      // Create download link
      const blob = new Blob(['PDF content would be here'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diabetes-risk-analysis-${presentationData.areaName}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Generate shareable link
  const generateShareableLink = async () => {
    try {
      // In a real implementation, this would save the presentation data
      // and return a shareable URL
      const linkId = generateLinkId();
      const link = `${window.location.origin}/presentation/${linkId}`;
      setShareableLink(link);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(link);
    } catch (error) {
      console.error('Failed to generate shareable link:', error);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!isVisible) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          prevSlide();
          break;
        case 'ArrowRight':
        case ' ':
          nextSlide();
          break;
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen();
          } else {
            onClose();
          }
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isVisible, isFullscreen]);

  if (!isVisible || !presentationData || !slides.length) {
    return null;
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className={`presentation-mode ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Presentation Header */}
      <div className="presentation-header">
        <div className="header-left">
          <MdSlideshow className="presentation-icon" />
          <span className="presentation-title">Stakeholder Presentation</span>
        </div>
        
        <div className="header-controls">
          <button 
            onClick={exportToPDF}
            disabled={isExporting}
            className="control-button export-button"
            title="Export to PDF"
          >
            {isExporting ? (
              <div className="loading-spinner small"></div>
            ) : (
              <MdPictureAsPdf />
            )}
            Export PDF
          </button>
          
          <button 
            onClick={generateShareableLink}
            className="control-button share-button"
            title="Generate Shareable Link"
          >
            <MdShare />
            Share
          </button>
          
          <button 
            onClick={() => window.print()}
            className="control-button print-button"
            title="Print"
          >
            <MdPrint />
            Print
          </button>
          
          <button 
            onClick={toggleFullscreen}
            className="control-button fullscreen-button"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <MdFullscreenExit /> : <MdFullscreen />}
          </button>
          
          <button 
            onClick={onClose}
            className="control-button close-button"
            title="Close Presentation"
          >
            <MdClose />
          </button>
        </div>
      </div>

      {/* Slide Content */}
      <div className="slide-container">
        <SlideRenderer 
          slide={currentSlideData}
          slideNumber={currentSlide + 1}
          totalSlides={slides.length}
        />
      </div>

      {/* Navigation */}
      <div className="presentation-navigation">
        <div className="nav-controls">
          <button 
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="nav-button prev-button"
          >
            ← Previous
          </button>
          
          <div className="slide-indicator">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`slide-dot ${index === currentSlide ? 'active' : ''}`}
                title={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          
          <button 
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="nav-button next-button"
          >
            Next →
          </button>
        </div>
        
        <div className="slide-counter">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>

      {/* Shareable Link Modal */}
      {shareableLink && (
        <ShareableLinkModal 
          link={shareableLink}
          onClose={() => setShareableLink(null)}
        />
      )}
    </div>
  );
};

/**
 * Individual Slide Renderer Component
 */
const SlideRenderer = ({ slide, slideNumber, totalSlides }) => {
  if (!slide) return null;

  const slideComponents = {
    'title': TitleSlide,
    'executive-summary': ExecutiveSummarySlide,
    'risk-overview': RiskOverviewSlide,
    'root-cause': RootCauseSlide,
    'action-plan': ActionPlanSlide,
    'evidence': EvidenceSlide
  };

  const SlideComponent = slideComponents[slide.type] || DefaultSlide;

  return (
    <div className={`slide slide-${slide.type}`}>
      <SlideComponent 
        {...slide}
        slideNumber={slideNumber}
        totalSlides={totalSlides}
      />
    </div>
  );
};

/**
 * Title Slide Component
 */
const TitleSlide = ({ title, subtitle, metadata }) => (
  <div className="title-slide">
    <div className="title-content">
      <h1 className="slide-title">{title}</h1>
      <h2 className="slide-subtitle">{subtitle}</h2>
      
      <div className="title-metadata">
        <div className="metadata-item">
          <strong>Analysis Date:</strong> {metadata.date}
        </div>
        <div className="metadata-item">
          <strong>Area:</strong> {metadata.area}
        </div>
        <div className="metadata-item">
          <strong>Source:</strong> {metadata.source}
        </div>
      </div>
    </div>
    
    <div className="title-branding">
      <div className="brand-logo">🎯</div>
      <div className="brand-text">RiskPulse: Diabetes</div>
    </div>
  </div>
);

/**
 * Executive Summary Slide Component
 */
const ExecutiveSummarySlide = ({ title, content }) => (
  <div className="executive-summary-slide">
    <h1 className="slide-title">{title}</h1>
    
    <div className="summary-grid">
      <div className="risk-assessment">
        <h3>Risk Assessment</h3>
        <div className={`risk-level risk-${content.riskLevel.level}`}>
          <span className="risk-icon">{content.riskLevel.icon}</span>
          <span className="risk-text">{content.riskLevel.label}</span>
        </div>
      </div>
      
      <div className="key-findings">
        <h3>Key Findings</h3>
        <ul className="findings-list">
          {content.keyFindings.map((finding, index) => (
            <li key={index} className="finding-item">
              <span className="finding-icon">•</span>
              {finding}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="recommendations">
        <h3>Priority Recommendations</h3>
        <ol className="recommendations-list">
          {content.recommendations.map((rec, index) => (
            <li key={index} className="recommendation-item">
              {rec}
            </li>
          ))}
        </ol>
      </div>
      
      <div className="urgency-assessment">
        <h3>Action Urgency</h3>
        <div className={`urgency-level urgency-${content.urgency.level}`}>
          <span className="urgency-icon">{content.urgency.icon}</span>
          <span className="urgency-text">{content.urgency.label}</span>
        </div>
        <p className="urgency-description">{content.urgency.description}</p>
      </div>
    </div>
  </div>
);

/**
 * Risk Overview Slide Component
 */
const RiskOverviewSlide = ({ title, content }) => (
  <div className="risk-overview-slide">
    <h1 className="slide-title">{title}</h1>
    
    <div className="overview-grid">
      <div className="metrics-display">
        <h3>Health Metrics</h3>
        <div className="metrics-grid">
          {Object.entries(content.metrics).map(([key, value]) => (
            <div key={key} className="metric-card">
              <span className="metric-label">{formatMetricLabel(key)}</span>
              <span className="metric-value">{formatMetricValue(value, key)}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="risk-factors">
        <h3>Primary Risk Factors</h3>
        <div className="factors-list">
          {content.primaryConcerns.map((factor, index) => (
            <div key={index} className="factor-item">
              <div className="factor-header">
                <span className="factor-rank">#{index + 1}</span>
                <span className="factor-name">{factor.label}</span>
                <span className={`factor-severity severity-${factor.severity}`}>
                  {factor.severity.toUpperCase()}
                </span>
              </div>
              <div className="factor-value">{factor.value.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Root Cause Analysis Slide Component
 */
const RootCauseSlide = ({ title, content }) => (
  <div className="root-cause-slide">
    <h1 className="slide-title">{title}</h1>
    
    <div className="analysis-content">
      <div className="primary-factors-section">
        <h3>Primary Contributing Factors</h3>
        <div className="factors-visualization">
          {content.primaryFactors.map((factor, index) => (
            <div key={index} className="factor-bubble">
              <div className="bubble-content">
                <span className="factor-label">{factor.label}</span>
                <span className="factor-impact">{factor.impact.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="correlations-section">
        <h3>Factor Correlations</h3>
        <div className="correlations-display">
          {content.correlations.map((corr, index) => {
            const metric1Config = findMetricConfig(corr.metric1);
            const metric2Config = findMetricConfig(corr.metric2);
            
            return (
              <div key={index} className="correlation-item">
                <div className="correlation-strength">
                  {(corr.strength * 100).toFixed(0)}%
                </div>
                <div className="correlation-relationship">
                  <span>{metric1Config?.label || corr.metric1}</span>
                  <span className="correlation-arrow">↔</span>
                  <span>{metric2Config?.label || corr.metric2}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="insights-section">
        <h3>AI-Generated Insights</h3>
        <div className="insights-list">
          {content.insights.map((insight, index) => (
            <div key={index} className={`insight-card insight-${insight.priority}`}>
              <span className="insight-icon">{insight.icon}</span>
              <div className="insight-content">
                <h4>{insight.title}</h4>
                <p>{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Action Plan Slide Component
 */
const ActionPlanSlide = ({ title, content }) => (
  <div className="action-plan-slide">
    <h1 className="slide-title">{title}</h1>
    
    <div className="action-timeline">
      <div className="timeline-section immediate">
        <h3>🚨 Immediate Actions (0-3 months)</h3>
        <ul className="action-list">
          {content.immediateActions.map((action, index) => (
            <li key={index} className="action-item immediate-action">
              {action}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="timeline-section medium-term">
        <h3>📋 Medium-Term Actions (3-12 months)</h3>
        <ul className="action-list">
          {content.mediumTermActions.map((action, index) => (
            <li key={index} className="action-item medium-action">
              {action}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="timeline-section long-term">
        <h3>🎯 Long-Term Goals (1-3 years)</h3>
        <ul className="action-list">
          {content.longTermActions.map((action, index) => (
            <li key={index} className="action-item long-action">
              {action}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

/**
 * Evidence Slide Component
 */
const EvidenceSlide = ({ title, content }) => (
  <div className="evidence-slide">
    <h1 className="slide-title">{title}</h1>
    
    <div className="evidence-content">
      <div className="data-methodology">
        <h3>Data Sources & Methodology</h3>
        <div className="methodology-grid">
          <div className="source-item">
            <strong>Primary Data Source:</strong> {content.dataSource}
          </div>
          <div className="method-item">
            <strong>Analysis Method:</strong> {content.methodology}
          </div>
          <div className="confidence-item">
            <strong>Confidence Level:</strong> 
            <span className={`confidence-badge confidence-${content.confidenceLevel}`}>
              {content.confidenceLevel.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      
      <div className="limitations-section">
        <h3>Analysis Limitations</h3>
        <ul className="limitations-list">
          {content.limitations.map((limitation, index) => (
            <li key={index} className="limitation-item">
              <span className="limitation-icon">⚠️</span>
              {limitation}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

/**
 * Default Slide Component
 */
const DefaultSlide = ({ title, content }) => (
  <div className="default-slide">
    <h1 className="slide-title">{title}</h1>
    <div className="slide-content">
      <pre>{JSON.stringify(content, null, 2)}</pre>
    </div>
  </div>
);

/**
 * Shareable Link Modal Component
 */
const ShareableLinkModal = ({ link, onClose }) => (
  <div className="modal-overlay">
    <div className="shareable-link-modal">
      <div className="modal-header">
        <h3>Shareable Presentation Link</h3>
        <button onClick={onClose} className="modal-close">
          <MdClose />
        </button>
      </div>
      
      <div className="modal-content">
        <p>Your presentation has been saved and is accessible via this link:</p>
        <div className="link-display">
          <input 
            type="text" 
            value={link} 
            readOnly 
            className="link-input"
          />
          <button 
            onClick={() => navigator.clipboard.writeText(link)}
            className="copy-button"
          >
            Copy
          </button>
        </div>
        <p className="link-note">
          Link copied to clipboard! Share this with stakeholders for easy access.
        </p>
      </div>
    </div>
  </div>
);

// Helper functions
const extractKeyMetrics = (areaData) => {
  return {
    riskScore: parseFloat(areaData.RiskScore || 0),
    diabetes: parseFloat(areaData.DIABETES_CrudePrev || 0),
    obesity: parseFloat(areaData.OBESITY_CrudePrev || 0),
    hypertension: parseFloat(areaData.BPHIGH_CrudePrev || areaData.hypertension_avg || 0),
    physicalActivity: parseFloat(areaData.LPA_CrudePrev || areaData.physical_inactivity_avg || 0),
    smoking: parseFloat(areaData.CSMOKING_CrudePrev || areaData.smoking_avg || 0),
    foodInsecurity: parseFloat(areaData.food_insecurity_avg || 0)
  };
};

const calculateRiskLevel = (metrics) => {
  const riskScore = metrics.riskScore || 0;
  
  if (riskScore >= 80) {
    return { level: 'critical', label: 'Critical Risk', icon: '🚨' };
  } else if (riskScore >= 60) {
    return { level: 'high', label: 'High Risk', icon: '⚠️' };
  } else if (riskScore >= 40) {
    return { level: 'moderate', label: 'Moderate Risk', icon: '⚡' };
  } else {
    return { level: 'low', label: 'Low Risk', icon: '✅' };
  }
};

const generateKeyFindings = (analysis) => {
  const findings = [];
  
  if (analysis?.primaryFactors?.length > 0) {
    const topFactor = analysis.primaryFactors[0];
    findings.push(`${topFactor.label} is the primary risk driver at ${topFactor.value.toFixed(1)}%`);
  }
  
  if (analysis?.correlations?.length > 0) {
    findings.push(`${analysis.correlations.length} significant factor correlations identified`);
  }
  
  if (analysis?.insights?.length > 0) {
    findings.push(`${analysis.insights.length} actionable insights generated from data analysis`);
  }
  
  return findings.length > 0 ? findings : ['Comprehensive health data analysis completed'];
};

const generateExecutiveRecommendations = (analysis) => {
  const recommendations = [];
  
  if (analysis?.primaryFactors?.length > 0) {
    recommendations.push(`Address ${analysis.primaryFactors[0].label.toLowerCase()} as immediate priority`);
  }
  
  if (analysis?.correlations?.length > 0) {
    recommendations.push('Implement multi-factor intervention approach based on identified correlations');
  }
  
  recommendations.push('Engage community stakeholders in implementation planning');
  
  return recommendations;
};

const assessUrgencyLevel = (analysis) => {
  const criticalFactors = analysis?.primaryFactors?.filter(f => f.severity === 'critical').length || 0;
  
  if (criticalFactors >= 2) {
    return { 
      level: 'high', 
      label: 'High Urgency', 
      icon: '🚨',
      description: 'Multiple critical risk factors require immediate intervention'
    };
  } else if (criticalFactors === 1) {
    return { 
      level: 'medium', 
      label: 'Medium Urgency', 
      icon: '⚡',
      description: 'Key risk factors identified, planned intervention recommended'
    };
  } else {
    return { 
      level: 'low', 
      label: 'Standard Priority', 
      icon: '📋',
      description: 'Systematic approach recommended for ongoing health improvement'
    };
  }
};

const generateImmediateActions = (analysis) => {
  const actions = [];
  
  if (analysis?.primaryFactors?.some(f => f.severity === 'critical')) {
    actions.push('Initiate emergency public health response for critical risk factors');
  }
  
  actions.push('Establish community health task force');
  actions.push('Secure funding for priority intervention programs');
  
  return actions;
};

const generateMediumTermActions = (analysis) => {
  return [
    'Implement evidence-based intervention programs',
    'Establish community partnerships for sustained impact',
    'Deploy health education and awareness campaigns',
    'Set up monitoring and evaluation systems'
  ];
};

const generateLongTermActions = (analysis) => {
  return [
    'Build sustainable community health infrastructure',
    'Advocate for policy changes to address root causes',
    'Establish long-term outcome tracking systems',
    'Create models for replication in similar communities'
  ];
};

const generateTimeline = (analysis) => {
  // This could be enhanced with specific timeline data
  return {
    immediate: '0-3 months',
    medium: '3-12 months',
    long: '1-3 years'
  };
};

const formatMetricLabel = (key) => {
  const labels = {
    riskScore: 'Risk Score',
    diabetes: 'Diabetes Rate',
    obesity: 'Obesity Rate',
    hypertension: 'Hypertension',
    physicalActivity: 'Physical Inactivity',
    smoking: 'Smoking Rate',
    foodInsecurity: 'Food Insecurity'
  };
  return labels[key] || key;
};

const formatMetricValue = (value, key) => {
  if (key === 'riskScore') {
    return `${value.toFixed(1)}`;
  }
  return `${value.toFixed(1)}%`;
};

const findMetricConfig = (metricKey) => {
  // This would reference the HEALTH_METRICS from correlationAnalysis.js
  const configs = {
    diabetes: { label: 'Diabetes Rate' },
    obesity: { label: 'Obesity Rate' },
    hypertension: { label: 'Hypertension' },
    physicalActivity: { label: 'Physical Inactivity' },
    smoking: { label: 'Smoking Rate' },
    foodInsecurity: { label: 'Food Insecurity' }
  };
  return configs[metricKey];
};

const simulatePDFGeneration = () => {
  return new Promise(resolve => setTimeout(resolve, 2000));
};

const generateLinkId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export default PresentationMode;
