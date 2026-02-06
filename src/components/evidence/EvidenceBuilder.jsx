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
  MdCheck,
  MdSlideshow,
  MdPictureAsPdf,
  MdLocationOn,
  MdTimer,
  MdLibraryBooks,
  MdTrendingUp,
  MdArrowForward,
  MdArrowBack,
  MdCheckCircle,
  MdRadioButtonUnchecked,
  MdAutoAwesome
} from 'react-icons/md';
import { useAppStore } from '../../store';
import { generateEvidencePackagePDF } from '../../services/pdfGeneration';
import { analyzeRootCauses } from '../../services/correlationAnalysis';
import { getApiEndpoint } from '../../services/chatService';

/**
 * Report Builder Component
 * Professional report generation for stakeholder engagement
 * Part of Layer 3: Report Package Builder
 */
const EvidenceBuilder = ({ 
  areaData,
  onPackageGenerated,
  className = ''
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
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
    outputFormat: 'pdf-report',
    includeCharts: true,
    includeRawData: false,
    confidentialityLevel: 'public',
    branding: 'standard'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPackage, setGeneratedPackage] = useState(null);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Get data from store
  const { selectedArea, aiSummary } = useAppStore();

  // CHNA Template Definitions
  const chnaTemplates = useMemo(() => [
    {
      id: 'chna-executive',
      title: 'CHNA Executive Summary',
      audience: 'City Council / Board of Health',
      description: 'High-level overview for decision makers',
      sections: {
        executiveSummary: true,
        riskAssessment: true,
        rootCauseAnalysis: false,
        recommendedActions: true,
        supportingData: false,
        methodology: false,
        appendices: false
      },
      estimatedPages: 8,
      timeToGenerate: '3-5 minutes',
      icon: MdTrendingUp,
      color: '#3b82f6'
    },
    {
      id: 'chna-detailed',
      title: 'Comprehensive CHNA Report',
      audience: 'State Health Department / Grant Applications',
      description: 'Full analysis with methodology and appendices',
      sections: {
        executiveSummary: true,
        riskAssessment: true,
        rootCauseAnalysis: true,
        recommendedActions: true,
        supportingData: true,
        methodology: true,
        appendices: true
      },
      estimatedPages: 25,
      timeToGenerate: '8-12 minutes',
      icon: MdDescription,
      color: '#10b981'
    },
    {
      id: 'stakeholder-presentation',
      title: 'Stakeholder Presentation Package',
      audience: 'Community Leaders / Funders',
      description: 'Visual presentation with key findings',
      sections: {
        executiveSummary: true,
        riskAssessment: true,
        rootCauseAnalysis: true,
        recommendedActions: true,
        supportingData: true,
        methodology: false,
        appendices: false
      },
      estimatedPages: 15,
      timeToGenerate: '5-7 minutes',
      icon: MdSlideshow,
      color: '#f59e0b'
    }
  ], []);

  // Builder Steps Configuration
  const builderSteps = useMemo(() => [
    {
      id: 1,
      title: 'Choose Template',
      icon: MdLibraryBooks,
      description: 'Select your presentation format',
      component: 'CHNATemplateSelector'
    },
    {
      id: 2,
      title: 'Customize Story',
      icon: MdEdit,
      description: 'Review and adjust your narrative',
      component: 'DataStoryBuilder'
    },
    {
      id: 3,
      title: 'Configure Details',
      icon: MdSettings,
      description: 'Set formatting and output options',
      component: 'PackageSettings'
    },
    {
      id: 4,
      title: 'Generate Package',
      icon: MdDownload,
      description: 'Create your evidence package',
      component: 'GenerationInterface'
    }
  ], []);

  // Output Format Options
  const outputFormats = useMemo(() => [
    {
      id: 'pdf-report',
      title: 'PDF Report',
      icon: MdPictureAsPdf,
      description: 'Professional report for grants and formal presentations',
      features: ['Executive summary', 'Charts and graphs', 'Appendices', 'References'],
      audience: 'Funders, State Health Dept',
      bestFor: 'Grant applications, formal reports',
      color: '#dc2626'
    },
    {
      id: 'powerpoint',
      title: 'PowerPoint Deck',
      icon: MdSlideshow,
      description: 'Presentation slides for stakeholder meetings',
      features: ['Visual slides', 'Speaker notes', 'Editable charts', 'Key findings'],
      audience: 'City Council, Board of Health',
      bestFor: 'Live presentations, meetings',
      color: '#ea580c'
    },
    {
      id: 'executive-brief',
      title: 'Executive Brief',
      icon: MdDescription,
      description: 'Concise summary for busy decision makers',
      features: ['2-page summary', 'Key metrics', 'Action items', 'Budget overview'],
      audience: 'Executives, Mayors',
      bestFor: 'Quick reviews, approvals',
      color: '#059669'
    }
  ], []);

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
      console.log('🔄 Generating evidence package with data:', evidenceData);
      
      let finalSummary = evidenceData.summary;

      // 1. Generate AI Summary if missing
      if (!finalSummary || finalSummary.trim() === 'Health risk analysis for the selected area') {
        setGenerationProgress(20);
        console.log('📝 AI Summary missing, generating on-the-fly...');
        
        try {
          // Construct a prompt for the summary
          const prompt = `Analyze the diabetes risk profile for ${evidenceData.areaName}. ` +
            `Key stats: Diabetes Rate ${evidenceData.metrics.diabetes}%, Obesity ${evidenceData.metrics.obesity}%, ` +
            `Risk Score ${evidenceData.metrics.riskScore}. ` +
            `Provide a professional 2-paragraph executive summary for a public health report.`;

          // Prepare request to backend
          const enhancedQuery = {
             context: { viewMode: 'zipcode' }, // Simplified context
             intent: 'analysis',
             boroughContext: null
          };
          
          const endpoint = getApiEndpoint(enhancedQuery);
          
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: prompt,
              messages: [],
              selected_area: evidenceData.rawProperties || {}, // Pass properties if available
              context: {
                viewMode: 'zipcode',
                selectedBorough: 'All'
              }
            })
          });

          if (response.ok) {
            const data = await response.json();
            finalSummary = data.response;
            console.log('✅ AI Summary generated successfully');
          } else {
            console.warn('⚠️ Failed to generate AI summary:', response.status);
            finalSummary = "Summary could not be generated at this time. Please rely on the data metrics provided below.";
          }
        } catch (err) {
          console.error('❌ Error generating AI summary:', err);
          finalSummary = "Summary generation unavailable.";
        }
      }

      setGenerationProgress(50);
      
      // Ensure proper data structure for PDF generation
      const packageData = {
        id: `pkg-${Date.now().toString(36)}`,
        title: packageSettings.title || `Diabetes Risk Evidence Package - ${evidenceData.areaName}`,
        areaName: evidenceData.areaName,
        audience: packageSettings.audience,
        format: packageSettings.format,
        
        // Fix: Ensure metrics are properly structured with fallbacks
        metrics: {
          riskScore: evidenceData.metrics?.riskScore || evidenceData.metrics?.RiskScore || 0,
          diabetes: evidenceData.metrics?.diabetes || evidenceData.metrics?.DIABETES_CrudePrev || 0,
          obesity: evidenceData.metrics?.obesity || evidenceData.metrics?.OBESITY_CrudePrev || 0,
          hypertension: evidenceData.metrics?.hypertension || evidenceData.metrics?.BPHIGH_CrudePrev || 0,
          physicalActivity: evidenceData.metrics?.physicalActivity || evidenceData.metrics?.LPA_CrudePrev || 0,
          smoking: evidenceData.metrics?.smoking || evidenceData.metrics?.CSMOKING_CrudePrev || 0,
          foodInsecurity: evidenceData.metrics?.foodInsecurity || evidenceData.metrics?.FOODINSECU_CrudePrev || 0,
          healthcareAccess: evidenceData.metrics?.healthcareAccess || evidenceData.metrics?.ACCESS2_CrudePrev || 0,
          population: evidenceData.metrics?.population || evidenceData.metrics?.TotalPopulation || 0
        },
        
        // Fix: Ensure analysis data structure exists
        analysis: evidenceData.analysis || {
          topFactors: [
            { 
              factor: "Data Analysis", 
              correlation: 0.5, 
              description: "Analysis based on available health data for this area" 
            }
          ]
        },
        
        summary: finalSummary, // Use the fetched or existing summary
        sections: selectedSections,
        customSections: customSections.filter(s => !s.isEditing),
        metadata: {
          generatedAt: new Date().toISOString(),
          estimatedPages: selectedTemplate?.estimatedPages || estimatedPages,
          confidentialityLevel: packageSettings.confidentialityLevel,
          dataSource: 'NYC Department of Health and Mental Hygiene',
          analysisConfidence: evidenceData.confidence || 'moderate'
        },
        downloadUrl: null 
      };
      
      // Add sections content
      packageData.sections = generateSectionContents();
      
      setGenerationProgress(80);
      console.log('📄 Generating PDF document...');

      // 2. Generate PDF using the service
      const pdfResult = await generateEvidencePackagePDF(packageData);
      
      setGenerationProgress(100);
      console.log('✅ PDF Generated successfully');

      // 3. Trigger Download
      const filename = `RiskPulse_Report_${evidenceData.areaName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdfResult.save(filename);
      
      console.log('✅ Package data prepared and downloaded:', packageData);
      
      setGeneratedPackage(packageData);
      
      if (onPackageGenerated) {
        onPackageGenerated(packageData);
      }
      
    } catch (error) {
      console.error('❌ Evidence package generation failed:', error);
      alert(`Failed to generate evidence package: ${error.message}`);
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

  // Template Selection Handler
  const selectTemplate = (template) => {
    setSelectedTemplate(template);
    setSelectedSections(template.sections);
    setPackageSettings(prev => ({
      ...prev,
      title: prev.title || `${template.title} - ${evidenceData?.areaName || 'Selected Area'}`,
      audience: template.audience.split(' / ')[0].toLowerCase(),
      format: template.id.includes('detailed') ? 'comprehensive' : 'executive'
    }));
    setActiveStep(2);
  };

  // Calculate comparison percentage
  const calculateComparison = (value, baseline = 12.5) => {
    const diff = ((value - baseline) / baseline) * 100;
    return diff > 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
  };

  // Step Navigation
  const nextStep = () => {
    setActiveStep(prev => Math.min(builderSteps.length, prev + 1));
  };

  const prevStep = () => {
    setActiveStep(prev => Math.max(1, prev - 1));
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
    <div className={`evidence-builder-enhanced ${className}`}>
      {/* Progress Steps - Clean Horizontal Design */}
      <div className="builder-progress-horizontal">
        {builderSteps.map((step, idx) => (
          <div key={step.id} className="progress-step-container">
            <div className="progress-step-wrapper">
              <div 
                className={`progress-step-circle ${
                  activeStep === step.id ? 'active' : 
                  activeStep > step.id ? 'completed' : 'pending'
                }`}
              >
                {activeStep > step.id ? (
                  <MdCheckCircle className="step-check-icon" />
                ) : (
                  <span className="step-number">{step.id}</span>
                )}
              </div>
              <div className="progress-step-labels">
                <h4 className="step-title">{step.title}</h4>
                <p className="step-description">{step.description}</p>
              </div>
            </div>
            {/* Connection Line */}
            {idx < builderSteps.length - 1 && (
              <div className={`progress-connector ${activeStep > step.id ? 'completed' : 'pending'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Builder Content */}
      <div className="builder-content">
        <div className="step-panel">
          {activeStep === 1 && (
            <CHNATemplateSelector 
              templates={chnaTemplates}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={selectTemplate}
              evidenceData={evidenceData}
            />
          )}
          
          {activeStep === 2 && (
            <DataStoryBuilder 
              evidenceData={evidenceData}
              selectedTemplate={selectedTemplate}
              onUpdateStory={(story) => console.log('Story updated:', story)}
            />
          )}
          
          {activeStep === 3 && (
            <PackageConfigurationPanel 
              packageSettings={packageSettings}
              onUpdateSettings={setPackageSettings}
              outputFormats={outputFormats}
              evidenceData={evidenceData}
            />
          )}
          
          {activeStep === 4 && (
            <GenerationInterface 
              packageSettings={packageSettings}
              selectedSections={selectedSections}
              evidenceData={evidenceData}
              isGenerating={isGenerating}
              generationProgress={generationProgress}
              onGenerate={generateEvidencePackage}
              generatedPackage={generatedPackage}
            />
          )}
        </div>
        
        {/* Live Preview Panel */}
        <div className="preview-panel">
          <PackagePreview 
            evidenceData={evidenceData}
            currentStep={activeStep}
            selectedTemplate={selectedTemplate}
            packageSettings={packageSettings}
            selectedSections={selectedSections}
            estimatedPages={estimatedPages}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="builder-navigation">
        <button 
          className="nav-button secondary"
          onClick={prevStep}
          disabled={activeStep === 1}
        >
          <MdArrowBack />
          Previous
        </button>
        
        <div className="nav-info">
          <span className="step-indicator">Step {activeStep} of {builderSteps.length}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(activeStep / builderSteps.length) * 100}%` }}
            />
          </div>
        </div>
        
        <button 
          className="nav-button primary"
          onClick={activeStep === builderSteps.length ? generateEvidencePackage : nextStep}
          disabled={activeStep === 1 && !selectedTemplate}
        >
          {activeStep === builderSteps.length ? (
            <>
              <MdDownload />
              Generate Package
            </>
          ) : (
            <>
              Next
              <MdArrowForward />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

/**
 * CHNA Template Selector Component
 */
const CHNATemplateSelector = ({ templates, selectedTemplate, onSelectTemplate, evidenceData }) => {
  return (
    <div className="chna-template-selector">
      <div className="template-header">
        <h3>Choose Your Evidence Package Type</h3>
        <p className="template-subtitle">
          Select the format that best fits your stakeholder presentation needs for {evidenceData.areaName}
        </p>
      </div>
      
      <div className="template-grid">
        {templates.map(template => {
          const IconComponent = template.icon;
          return (
            <div 
              key={template.id} 
              className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
              onClick={() => onSelectTemplate(template)}
            >
              <div className="template-card-header">
                <div className="template-icon-wrapper" style={{ backgroundColor: template.color }}>
                  <IconComponent className="template-icon" />
                </div>
                <div className="template-meta">
                  <h4 className="template-title">{template.title}</h4>
                  <span className="audience-badge">{template.audience}</span>
                </div>
              </div>
              
              <p className="template-description">{template.description}</p>
              
              <div className="template-specs">
                <div className="spec-item">
                  <MdDescription className="spec-icon" />
                  <span>{template.estimatedPages} pages</span>
                </div>
                <div className="spec-item">
                  <MdTimer className="spec-icon" />
                  <span>{template.timeToGenerate}</span>
                </div>
              </div>
              
              <div className="template-sections">
                <h5>Includes:</h5>
                <div className="section-badges">
                  {Object.entries(template.sections).filter(([_, included]) => included).map(([sectionId, _]) => (
                    <span key={sectionId} className="section-badge">
                      {sectionId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
              
              <button className="template-select-btn">
                {selectedTemplate?.id === template.id ? 'Selected' : 'Select Template'}
              </button>
            </div>
          );
        })}
      </div>
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
const GeneratedPackageDisplay = ({ package: packageData, onDownload }) => {
  return (
    <div className="generated-package">
      <div className="package-header">
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
      </div>
    </div>
  );
};

/**
 * Data Story Builder Component
 */
const DataStoryBuilder = ({ evidenceData, selectedTemplate, onUpdateStory }) => {
  const [storyStructure, setStoryStructure] = useState({
    problem: {
      title: `Diabetes Hotspot Identified in ${evidenceData.areaName}`,
      keyMetric: evidenceData.metrics.diabetes,
      comparison: 'City Average',
      severity: 'High Priority'
    },
    context: {
      rootCauses: evidenceData.analysis.topFactors || [],
      socialDeterminants: evidenceData.analysis.socialFactors || [],
      riskFactors: evidenceData.analysis.riskFactors || []
    },
    solution: {
      interventions: evidenceData.analysis.recommendedInterventions || [],
      evidence: 'CDC-approved programs',
      timeline: '12-month implementation'
    }
  });

  const calculateComparison = (value, baseline = 12.5) => {
    const diff = ((value - baseline) / baseline) * 100;
    return diff > 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
  };

  return (
    <div className="data-story-builder">
      <div className="story-header">
        <h3>Your Data Story</h3>
        <p className="story-subtitle">AI-generated narrative structure for your {selectedTemplate?.title}</p>
      </div>
      
      <div className="story-flow">
        {/* Problem Statement */}
        <div className="story-section problem-section">
          <div className="section-header">
            <div className="section-number">1</div>
            <h4>The Problem</h4>
            <span className="section-subtitle">"Here is the health disparity"</span>
          </div>
          
          <div className="story-content">
            <div className="key-finding">
              <span className="metric-value">{storyStructure.problem.keyMetric}%</span>
              <span className="metric-label">diabetes prevalence</span>
              <span className="comparison-badge">
                {calculateComparison(storyStructure.problem.keyMetric)} vs city average
              </span>
            </div>
            
            <div className="geographic-context">
              <MdLocationOn className="context-icon" />
              <span>{evidenceData.areaName} requires immediate attention</span>
            </div>
          </div>
        </div>

        {/* Context/Why */}
        <div className="story-section context-section">
          <div className="section-header">
            <div className="section-number">2</div>
            <h4>The Context</h4>
            <span className="section-subtitle">"Here's why this disparity exists"</span>
          </div>
          
          <div className="story-content">
            <div className="root-causes">
              {storyStructure.context.rootCauses.slice(0, 3).map((cause, idx) => (
                <div key={idx} className="cause-item">
                  <div className="cause-strength">{cause.strength}%</div>
                  <div className="cause-label">{cause.factor}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Solution */}
        <div className="story-section solution-section">
          <div className="section-header">
            <div className="section-number">3</div>
            <h4>The Solution</h4>
            <span className="section-subtitle">"Here's our evidence-based action plan"</span>
          </div>
          
          <div className="story-content">
            <div className="intervention-preview">
              <div className="intervention-type">
                {storyStructure.solution.interventions[0]?.type || 'Evidence-based intervention'}
              </div>
              <div className="evidence-badge">
                {storyStructure.solution.evidence}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Package Configuration Panel
 */
const PackageConfigurationPanel = ({ packageSettings, onUpdateSettings, outputFormats, evidenceData }) => {
  return (
    <div className="package-configuration">
      <div className="config-header">
        <h3>Configure Your Evidence Package</h3>
        <p className="config-subtitle">Customize the details and format for your presentation</p>
      </div>
      
      <div className="config-sections">
        {/* Basic Settings */}
        <div className="config-section">
          <h4>Package Details</h4>
          <div className="settings-grid">
            <div className="setting-group">
              <label htmlFor="package-title">Package Title</label>
              <input
                id="package-title"
                type="text"
                value={packageSettings.title}
                onChange={(e) => onUpdateSettings(prev => ({ ...prev, title: e.target.value }))
                }
                placeholder={`Diabetes Risk Evidence Package - ${evidenceData.areaName}`}
                className="setting-input"
              />
            </div>
            
            <div className="setting-group">
              <label htmlFor="target-audience">Target Audience</label>
              <select
                id="target-audience"
                value={packageSettings.audience}
                onChange={(e) => onUpdateSettings(prev => ({ ...prev, audience: e.target.value }))
                }
                className="setting-select"
              >
                <option value="stakeholders">Stakeholders & Decision Makers</option>
                <option value="technical">Technical/Medical Professionals</option>
                <option value="community">Community Leaders</option>
                <option value="funding">Funding Organizations</option>
              </select>
            </div>
          </div>
        </div>

        {/* Output Format Selection */}
        <div className="config-section">
          <h4>Output Format</h4>
          <div className="format-options">
            {outputFormats.map(format => {
              const IconComponent = format.icon;
              return (
                <div 
                  key={format.id} 
                  className={`format-option ${packageSettings.outputFormat === format.id ? 'selected' : ''}`}
                  onClick={() => onUpdateSettings(prev => ({ ...prev, outputFormat: format.id }))
                  }
                >
                  <div className="format-icon-wrapper" style={{ backgroundColor: format.color }}>
                    <IconComponent className="format-icon" />
                  </div>
                  <div className="format-details">
                    <h5>{format.title}</h5>
                    <p>{format.description}</p>
                    <span className="format-best-for">Best for: {format.bestFor}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Advanced Options */}
        <div className="config-section">
          <h4>Advanced Options</h4>
          <div className="settings-toggles">
            <label className="toggle-setting">
              <input
                type="checkbox"
                checked={packageSettings.includeCharts}
                onChange={(e) => onUpdateSettings(prev => ({ ...prev, includeCharts: e.target.checked }))
                }
              />
              <span className="toggle-label">Include Charts & Visualizations</span>
            </label>
            
            <label className="toggle-setting">
              <input
                type="checkbox"
                checked={packageSettings.includeRawData}
                onChange={(e) => onUpdateSettings(prev => ({ ...prev, includeRawData: e.target.checked }))
                }
              />
              <span className="toggle-label">Include Raw Data Tables</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Generation Interface Component
 */
const GenerationInterface = ({ 
  packageSettings, 
  selectedSections, 
  evidenceData, 
  isGenerating, 
  generationProgress, 
  onGenerate, 
  generatedPackage 
}) => {
  const estimatedPages = Object.values(selectedSections).filter(Boolean).length * 3;
  
  return (
    <div className="generation-interface">
      <div className="generation-header">
        <h3>Generate Your Evidence Package</h3>
        <p className="generation-subtitle">Review your selections and create your professional document</p>
      </div>
      
      <div className="generation-content">
        {!generatedPackage ? (
          <div className="pre-generation">
            <div className="package-summary">
              <h4>Package Summary</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Title:</span>
                  <span className="summary-value">{packageSettings.title || 'Evidence Package'}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Format:</span>
                  <span className="summary-value">{packageSettings.outputFormat}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Pages:</span>
                  <span className="summary-value">~{estimatedPages} pages</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Audience:</span>
                  <span className="summary-value">{packageSettings.audience}</span>
                </div>
              </div>
            </div>
            
            <div className="generation-controls">
              <button 
                onClick={onGenerate}
                disabled={isGenerating}
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
            
            {isGenerating && (
              <div className="generation-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <p className="progress-text">
                  {generationProgress < 40 ? 'Analyzing data patterns...' :
                   generationProgress < 60 ? 'Generating narrative structure...' :
                   generationProgress < 80 ? 'Creating visualizations...' :
                   generationProgress < 100 ? 'Compiling evidence package...' :
                   'Package ready for download!'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <GeneratedPackageDisplay 
            package={generatedPackage}
            onDownload={() => downloadPackage(generatedPackage)}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Package Preview Component
 */
const PackagePreview = ({ 
  evidenceData, 
  currentStep, 
  selectedTemplate, 
  packageSettings, 
  selectedSections, 
  estimatedPages 
}) => {
  return (
    <div className="package-preview">
      <h4 className="preview-title">Package Preview</h4>
      
      <div className="preview-content">
        <div className="preview-header">
          <div className="preview-icon">
            <MdFolder />
          </div>
          <div className="preview-details">
            <h5>{packageSettings.title || `Evidence Package - ${evidenceData?.areaName || 'Selected Area'}`}</h5>
            <p className="preview-meta">
              {estimatedPages || 0} pages • {packageSettings.audience || 'stakeholders'}
            </p>
          </div>
        </div>
        
        <div className="preview-sections">
          <h6>Included Sections:</h6>
          <div className="section-list">
            {selectedSections && Object.entries(selectedSections).filter(([_, included]) => included).map(([sectionId, _]) => (
              <div key={sectionId} className="section-item">
                <MdCheck className="section-check" />
                <span>{sectionId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
              </div>
            ))}
          </div>
        </div>
        
        {selectedTemplate && (
          <div className="preview-template">
            <h6>Template:</h6>
            <div className="template-info">
              <span className="template-name">{selectedTemplate.title}</span>
              <span className="template-audience">{selectedTemplate.audience}</span>
            </div>
          </div>
        )}
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
    console.log('🔄 Starting PDF generation with data:', packageData);
    
    // Show loading state
    const downloadButton = document.querySelector('.download-button');
    if (downloadButton) {
      downloadButton.textContent = 'Generating PDF...';
      downloadButton.disabled = true;
    }
    
    // Validate package data
    if (!packageData || !packageData.areaName) {
      throw new Error('Invalid package data: Missing required fields');
    }
    
    if (!packageData.metrics) {
      throw new Error('Invalid package data: Missing metrics');
    }
    
    console.log('✅ Package data validation passed');
    
    // Generate PDF using the PDF service
    console.log('🔄 Calling PDF generation service...');
    const pdfDoc = await generateEvidencePackagePDF(packageData);
    console.log('✅ PDF generated successfully:', pdfDoc);
    
    // Create filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const areaName = packageData.areaName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Evidence_Package_${areaName}_${timestamp}.pdf`;
    
    // Trigger download
    console.log('💾 Triggering download:', filename);
    pdfDoc.save(filename);
    console.log('🎉 PDF download completed successfully!');
    
    // Reset button state
    if (downloadButton) {
      downloadButton.innerHTML = '<span>📄</span> Download PDF';
      downloadButton.disabled = false;
    }
    
  } catch (error) {
    console.error('❌ PDF download failed:', error);
    console.error('📋 Error details:', {
      message: error.message,
      stack: error.stack,
      packageData: packageData
    });
    
    // Show user-friendly error message
    const errorMessage = error.message.includes('jsPDF') 
      ? 'PDF generation library error. Please refresh the page and try again.'
      : error.message.includes('Invalid package data')
      ? 'Invalid data for PDF generation. Please select an area and try again.'
      : `Failed to generate PDF: ${error.message}`;
    
    alert(errorMessage);
    
    // Reset button state
    const downloadButton = document.querySelector('.download-button');
    if (downloadButton) {
      downloadButton.innerHTML = '<span>📄</span> Download PDF';
      downloadButton.disabled = false;
    }
  }
};

export default EvidenceBuilder;
