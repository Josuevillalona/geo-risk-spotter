import React, { useState, useEffect, useMemo } from 'react';
import { 
  MdDescription,
  MdDownload,
  MdShare,
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdSettings,
  MdFolder,
  MdInsertDriveFile,
  MdCheck
} from 'react-icons/md';
import { useAppStore } from '../../store';
import { generateEvidencePackagePDF } from '../../services/pdfGeneration';
import { analyzeRootCauses } from '../../services/correlationAnalysis';

/**
 * Evidence Builder Component
 * Professional evidence package generation for stakeholder engagement
 * Part of Layer 3: Evidence Package Builder
 */
const EvidenceBuilder = ({ 
  areaData,
  onPackageGenerated,
  className = ''
}) => {
  const [selectedSections, setSelectedSections] = useState({
    executiveSummary: true,
    riskAssessment: true,
    rootCauseAnalysis: true,
    recommendedActions: true,
    supportingData: true,
    methodology: false,
    appendices: false
  });

  const [customSections, setCustomSections] = useState([]);
  const [packageSettings, setPackageSettings] = useState({
    title: '',
    audience: 'stakeholders',
    format: 'comprehensive',
    includeCharts: true,
    includeRawData: false,
    confidentialityLevel: 'public'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPackage, setGeneratedPackage] = useState(null);

  // Get data from store
  const { selectedArea, aiSummary } = useAppStore();

  // Generate evidence package data
  const evidenceData = useMemo(() => {
    if (!areaData) return null;

    const analysis = analyzeRootCauses(areaData);
    
    // Create a more descriptive area name with enhanced fallback logic
    // Debug: Log selectedArea properties to understand data structure
    console.log('selectedArea properties:', selectedArea?.properties);
    
    const zipCode = selectedArea?.properties?.ZCTA5CE10 ||    // Primary ZIP code property in NYC data
                    selectedArea?.properties?.zip_code || 
                    selectedArea?.properties?.ZIP_CODE || 
                    selectedArea?.properties?.zipcode || 
                    selectedArea?.properties?.ZIPCODE ||
                    selectedArea?.properties?.zip ||
                    selectedArea?.properties?.ZIP ||
                    selectedArea?.properties?.postalcode ||
                    selectedArea?.properties?.POSTALCODE;
                    
    const borough = selectedArea?.properties?.borough || 
                    selectedArea?.properties?.BOROUGH || 
                    selectedArea?.properties?.boro_name ||
                    selectedArea?.properties?.BORO_NAME ||
                    selectedArea?.properties?.boro ||
                    selectedArea?.properties?.BORO ||
                    selectedArea?.properties?.county ||
                    selectedArea?.properties?.COUNTY;
                    
    const neighborhood = selectedArea?.properties?.neighborhood || 
                         selectedArea?.properties?.NEIGHBORHOOD || 
                         selectedArea?.properties?.ntaname ||
                         selectedArea?.properties?.NTANAME ||
                         selectedArea?.properties?.nta_name ||
                         selectedArea?.properties?.NTA_NAME ||
                         selectedArea?.properties?.locality ||
                         selectedArea?.properties?.LOCALITY ||
                         selectedArea?.properties?.name ||
                         selectedArea?.properties?.NAME;
                         
    const areaId = selectedArea?.properties?.GEOID10 ||        // Primary GeoID in NYC data
                   selectedArea?.properties?.GEOID || 
                   selectedArea?.properties?.geoid || 
                   selectedArea?.properties?.id ||
                   selectedArea?.properties?.ID ||
                   selectedArea?.properties?.fid ||
                   selectedArea?.properties?.FID ||
                   selectedArea?.properties?.objectid ||
                   selectedArea?.properties?.OBJECTID;
    
    let areaName = 'Selected Area';
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
    } else if (neighborhood) {
      areaName = neighborhood;
    } else if (areaId) {
      areaName = `Area ${areaId}`;
    }
    
    // Debug: Log final area name
    console.log('Generated area name:', areaName);
    
    return {
      areaName,
      analysis,
      metrics: extractDetailedMetrics(areaData),
      summary: aiSummary,
      generatedAt: new Date().toISOString(),
      confidence: analysis?.confidence || 'medium'
    };
  }, [areaData, selectedArea, aiSummary]);

  // Define available evidence sections
  const availableSections = useMemo(() => [
    {
      id: 'executiveSummary',
      title: 'Executive Summary',
      description: 'High-level overview and key findings for decision-makers',
      essential: true,
      estimatedPages: 2
    },
    {
      id: 'riskAssessment',
      title: 'Risk Assessment',
      description: 'Comprehensive diabetes risk analysis with metrics and comparisons',
      essential: true,
      estimatedPages: 3
    },
    {
      id: 'rootCauseAnalysis',
      title: 'Root Cause Analysis',
      description: 'AI-powered correlation analysis and factor identification',
      essential: true,
      estimatedPages: 4
    },
    {
      id: 'recommendedActions',
      title: 'Recommended Actions',
      description: 'Evidence-based intervention recommendations with timelines',
      essential: true,
      estimatedPages: 3
    },
    {
      id: 'supportingData',
      title: 'Supporting Data',
      description: 'Charts, graphs, and statistical evidence',
      essential: false,
      estimatedPages: 5
    },
    {
      id: 'methodology',
      title: 'Methodology',
      description: 'Data sources, analysis methods, and limitations',
      essential: false,
      estimatedPages: 2
    },
    {
      id: 'appendices',
      title: 'Appendices',
      description: 'Raw data tables, additional charts, and references',
      essential: false,
      estimatedPages: 8
    }
  ], []);

  // Calculate estimated package size
  const estimatedPages = useMemo(() => {
    let pages = 0;
    
    Object.entries(selectedSections).forEach(([sectionId, isSelected]) => {
      if (isSelected) {
        const section = availableSections.find(s => s.id === sectionId);
        if (section) {
          pages += section.estimatedPages;
        }
      }
    });
    
    // Add custom sections (estimate 2 pages each)
    pages += customSections.length * 2;
    
    return pages;
  }, [selectedSections, customSections, availableSections]);

  // Handle section selection
  const toggleSection = (sectionId) => {
    setSelectedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Handle custom section addition
  const addCustomSection = () => {
    const newSection = {
      id: `custom-${Date.now()}`,
      title: '',
      description: '',
      content: '',
      isEditing: true
    };
    setCustomSections(prev => [...prev, newSection]);
  };

  // Handle custom section editing
  const updateCustomSection = (sectionId, updates) => {
    setCustomSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, ...updates }
          : section
      )
    );
  };

  // Handle custom section deletion
  const deleteCustomSection = (sectionId) => {
    setCustomSections(prev => prev.filter(section => section.id !== sectionId));
  };

  // Generate evidence package
  const generateEvidencePackage = async () => {
    if (!evidenceData) return;

    setIsGenerating(true);
    
    try {
      // Simulate package generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const packageData = {
        id: generatePackageId(),
        title: packageSettings.title || `Diabetes Risk Evidence Package - ${evidenceData.areaName}`,
        areaName: evidenceData.areaName,
        audience: packageSettings.audience,
        format: packageSettings.format,
        analysis: evidenceData.analysis, // Include the analysis data with health metrics
        metrics: evidenceData.metrics, // Include detailed metrics
        summary: evidenceData.summary, // Include AI summary
        sections: generateSectionContents(),
        customSections: customSections.filter(s => !s.isEditing),
        metadata: {
          generatedAt: new Date().toISOString(),
          estimatedPages,
          confidentialityLevel: packageSettings.confidentialityLevel,
          dataSource: 'NYC Department of Health and Mental Hygiene',
          analysisConfidence: evidenceData.confidence
        },
        downloadUrl: null // Would be set after actual generation
      };
      
      setGeneratedPackage(packageData);
      
      if (onPackageGenerated) {
        onPackageGenerated(packageData);
      }
      
    } catch (error) {
      console.error('Evidence package generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate section contents based on selected sections
  const generateSectionContents = () => {
    const contents = {};
    
    if (selectedSections.executiveSummary) {
      contents.executiveSummary = generateExecutiveSummary();
    }
    
    if (selectedSections.riskAssessment) {
      contents.riskAssessment = generateRiskAssessment();
    }
    
    if (selectedSections.rootCauseAnalysis) {
      contents.rootCauseAnalysis = generateRootCauseAnalysis();
    }
    
    if (selectedSections.recommendedActions) {
      contents.recommendedActions = generateRecommendedActions();
    }
    
    if (selectedSections.supportingData) {
      contents.supportingData = generateSupportingData();
    }
    
    if (selectedSections.methodology) {
      contents.methodology = generateMethodology();
    }
    
    if (selectedSections.appendices) {
      contents.appendices = generateAppendices();
    }
    
    return contents;
  };

  if (!evidenceData) {
    return (
      <div className={`evidence-builder empty ${className}`}>
        <div className="empty-state">
          <MdDescription className="empty-icon" />
          <h3>Evidence Package Builder</h3>
          <p>Select an area to generate professional evidence packages for stakeholder engagement</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`evidence-builder ${className}`}>
      {/* Header */}
      <div className="evidence-header">
        <div className="header-content">
          <MdDescription className="header-icon" />
          <div className="header-text">
            <h3 className="header-title">Evidence Package Builder</h3>
            <p className="header-subtitle">
              Generate professional documentation for {evidenceData.areaName}
            </p>
          </div>
        </div>
        
        <div className="package-stats">
          <div className="stat">
            <span className="stat-value">{estimatedPages}</span>
            <span className="stat-label">pages</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {Object.values(selectedSections).filter(Boolean).length + customSections.length}
            </span>
            <span className="stat-label">sections</span>
          </div>
        </div>
      </div>

      {/* Package Settings */}
      <div className="package-settings">
        <h4 className="settings-title">Package Configuration</h4>
        
        <div className="settings-grid">
          <div className="setting-group">
            <label htmlFor="package-title">Package Title</label>
            <input
              id="package-title"
              type="text"
              value={packageSettings.title}
              onChange={(e) => setPackageSettings(prev => ({ ...prev, title: e.target.value }))}
              placeholder={`Diabetes Risk Evidence Package - ${evidenceData.areaName}`}
              className="setting-input"
            />
          </div>
          
          <div className="setting-group">
            <label htmlFor="target-audience">Target Audience</label>
            <select
              id="target-audience"
              value={packageSettings.audience}
              onChange={(e) => setPackageSettings(prev => ({ ...prev, audience: e.target.value }))}
              className="setting-select"
            >
              <option value="stakeholders">Stakeholders & Decision Makers</option>
              <option value="technical">Technical/Medical Professionals</option>
              <option value="community">Community Leaders</option>
              <option value="funding">Funding Organizations</option>
            </select>
          </div>
          
          <div className="setting-group">
            <label htmlFor="package-format">Format Style</label>
            <select
              id="package-format"
              value={packageSettings.format}
              onChange={(e) => setPackageSettings(prev => ({ ...prev, format: e.target.value }))}
              className="setting-select"
            >
              <option value="comprehensive">Comprehensive Report</option>
              <option value="executive">Executive Brief</option>
              <option value="technical">Technical Analysis</option>
              <option value="presentation">Presentation Ready</option>
            </select>
          </div>
          
          <div className="setting-group">
            <label htmlFor="confidentiality">Confidentiality Level</label>
            <select
              id="confidentiality"
              value={packageSettings.confidentialityLevel}
              onChange={(e) => setPackageSettings(prev => ({ ...prev, confidentialityLevel: e.target.value }))}
              className="setting-select"
            >
              <option value="public">Public</option>
              <option value="internal">Internal Use</option>
              <option value="restricted">Restricted</option>
              <option value="confidential">Confidential</option>
            </select>
          </div>
        </div>
        
        <div className="settings-toggles">
          <label className="toggle-setting">
            <input
              type="checkbox"
              checked={packageSettings.includeCharts}
              onChange={(e) => setPackageSettings(prev => ({ ...prev, includeCharts: e.target.checked }))}
            />
            <span className="toggle-label">Include Charts & Visualizations</span>
          </label>
          
          <label className="toggle-setting">
            <input
              type="checkbox"
              checked={packageSettings.includeRawData}
              onChange={(e) => setPackageSettings(prev => ({ ...prev, includeRawData: e.target.checked }))}
            />
            <span className="toggle-label">Include Raw Data Tables</span>
          </label>
        </div>
      </div>

      {/* Section Selection */}
      <div className="section-selection">
        <h4 className="selection-title">Evidence Sections</h4>
        
        <div className="sections-grid">
          {availableSections.map(section => (
            <div 
              key={section.id} 
              className={`section-card ${selectedSections[section.id] ? 'selected' : ''} ${section.essential ? 'essential' : ''}`}
            >
              <div className="section-header">
                <label className="section-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedSections[section.id]}
                    onChange={() => toggleSection(section.id)}
                    disabled={section.essential}
                  />
                  <span className="checkbox-label">{section.title}</span>
                  {section.essential && <span className="essential-badge">Essential</span>}
                </label>
                
                <span className="section-pages">{section.estimatedPages} pages</span>
              </div>
              
              <p className="section-description">{section.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Sections */}
      <div className="custom-sections">
        <div className="custom-header">
          <h4 className="custom-title">Custom Sections</h4>
          <button onClick={addCustomSection} className="add-section-button">
            <MdAdd /> Add Custom Section
          </button>
        </div>
        
        {customSections.length > 0 && (
          <div className="custom-sections-list">
            {customSections.map(section => (
              <CustomSectionEditor
                key={section.id}
                section={section}
                onUpdate={(updates) => updateCustomSection(section.id, updates)}
                onDelete={() => deleteCustomSection(section.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Generation Controls */}
      <div className="generation-controls">
        <div className="controls-info">
          <div className="package-preview">
            <MdFolder className="preview-icon" />
            <div className="preview-details">
              <span className="preview-title">
                {packageSettings.title || `Evidence Package - ${evidenceData.areaName}`}
              </span>
              <span className="preview-meta">
                {estimatedPages} pages • {packageSettings.audience} • {packageSettings.confidentialityLevel}
              </span>
            </div>
          </div>
        </div>
        
        <div className="controls-actions">
          <button 
            onClick={generateEvidencePackage}
            disabled={isGenerating || estimatedPages === 0}
            className="generate-button primary"
          >
            {isGenerating ? (
              <>
                <div className="loading-spinner small"></div>
                Generating Package...
              </>
            ) : (
              <>
                <MdInsertDriveFile />
                Generate Evidence Package
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Package Display */}
      {generatedPackage && (
        <GeneratedPackageDisplay 
          package={generatedPackage}
          onDownload={() => downloadPackage(generatedPackage)}
          onShare={() => sharePackage(generatedPackage)}
        />
      )}
    </div>
  );
};

/**
 * Custom Section Editor Component
 */
const CustomSectionEditor = ({ section, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(section.isEditing || false);

  const handleSave = () => {
    if (section.title.trim()) {
      onUpdate({ isEditing: false });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (section.isEditing) {
      onDelete();
    } else {
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="custom-section-editor editing">
        <div className="editor-fields">
          <input
            type="text"
            value={section.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Section Title"
            className="title-input"
          />
          
          <textarea
            value={section.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Section Description"
            className="description-input"
            rows={2}
          />
          
          <textarea
            value={section.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Section Content (optional - can be added during generation)"
            className="content-input"
            rows={4}
          />
        </div>
        
        <div className="editor-actions">
          <button onClick={handleSave} className="save-button">
            <MdCheck /> Save
          </button>
          <button onClick={handleCancel} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="custom-section-editor">
      <div className="section-info">
        <h5 className="section-title">{section.title}</h5>
        <p className="section-description">{section.description}</p>
      </div>
      
      <div className="section-actions">
        <button onClick={() => setIsEditing(true)} className="edit-button">
          <MdEdit />
        </button>
        <button onClick={onDelete} className="delete-button">
          <MdDelete />
        </button>
      </div>
    </div>
  );
};

/**
 * Generated Package Display Component
 */
const GeneratedPackageDisplay = ({ package: packageData, onDownload, onShare }) => {
  return (
    <div className="generated-package">
      <div className="package-header">
        <MdCheck className="success-icon" />
        <div className="package-info">
          <h4 className="package-title">Evidence Package Generated</h4>
          <p className="package-details">
            {packageData.title} • {packageData.metadata.estimatedPages} pages
          </p>
        </div>
      </div>
      
      <div className="package-actions">
        <button onClick={onDownload} className="download-button">
          <MdDownload /> Download PDF
        </button>
        <button onClick={onShare} className="share-button">
          <MdShare /> Share Link
        </button>
        <button className="preview-button">
          <MdVisibility /> Preview
        </button>
      </div>
      
      <div className="package-metadata">
        <div className="metadata-grid">
          <div className="metadata-item">
            <span className="metadata-label">Generated:</span>
            <span className="metadata-value">
              {new Date(packageData.metadata.generatedAt).toLocaleString()}
            </span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Confidence:</span>
            <span className={`metadata-value confidence-${packageData.metadata.analysisConfidence}`}>
              {packageData.metadata.analysisConfidence.toUpperCase()}
            </span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Audience:</span>
            <span className="metadata-value">{packageData.audience}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions for generating section content
const extractDetailedMetrics = (areaData) => {
  return {
    riskScore: parseFloat(areaData.RiskScore || 0),
    diabetes: parseFloat(areaData.DIABETES_CrudePrev || 0),
    obesity: parseFloat(areaData.OBESITY_CrudePrev || 0),
    hypertension: parseFloat(areaData.BPHIGH_CrudePrev || areaData.hypertension_avg || 0),
    physicalActivity: parseFloat(areaData.LPA_CrudePrev || areaData.physical_inactivity_avg || 0),
    smoking: parseFloat(areaData.CSMOKING_CrudePrev || areaData.smoking_avg || 0),
    foodInsecurity: parseFloat(areaData.food_insecurity_avg || 0),
    // Additional metrics for detailed analysis
    population: areaData.population || 'N/A',
    medianIncome: areaData.median_income || 'N/A',
    healthcareAccess: parseFloat(areaData.healthcare_access || 0)
  };
};

const generateExecutiveSummary = () => ({
  type: 'executive-summary',
  content: 'Executive summary content would be generated here based on analysis results'
});

const generateRiskAssessment = () => ({
  type: 'risk-assessment',
  content: 'Risk assessment content with detailed metrics and comparisons'
});

const generateRootCauseAnalysis = () => ({
  type: 'root-cause-analysis',
  content: 'Root cause analysis with correlations and AI insights'
});

const generateRecommendedActions = () => ({
  type: 'recommended-actions',
  content: 'Evidence-based intervention recommendations with timelines'
});

const generateSupportingData = () => ({
  type: 'supporting-data',
  content: 'Charts, graphs, and statistical evidence'
});

const generateMethodology = () => ({
  type: 'methodology',
  content: 'Data sources, analysis methods, and limitations'
});

const generateAppendices = () => ({
  type: 'appendices',
  content: 'Raw data tables, additional charts, and references'
});

const generatePackageId = () => {
  return 'pkg-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const downloadPackage = async (packageData) => {
  try {
    // Show loading state
    const downloadButton = document.querySelector('.download-button');
    if (downloadButton) {
      downloadButton.textContent = 'Generating PDF...';
      downloadButton.disabled = true;
    }
    
    // Generate PDF using the PDF service
    const pdfDoc = await generateEvidencePackagePDF(packageData);
    
    // Create filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Evidence_Package_${packageData.areaName}_${timestamp}.pdf`;
    
    // Trigger download
    pdfDoc.save(filename);
    
    // Reset button state
    if (downloadButton) {
      downloadButton.innerHTML = '<span>📄</span> Download PDF';
      downloadButton.disabled = false;
    }
    
  } catch (error) {
    console.error('PDF download failed:', error);
    alert('Failed to generate PDF. Please try again.');
    
    // Reset button state
    const downloadButton = document.querySelector('.download-button');
    if (downloadButton) {
      downloadButton.innerHTML = '<span>📄</span> Download PDF';
      downloadButton.disabled = false;
    }
  }
};

const sharePackage = (packageData) => {
  // This would generate shareable link
  console.log('Sharing package:', packageData.id);
};

export default EvidenceBuilder;
