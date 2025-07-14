import React from 'react';
import { Button, Card, Typography, Badge } from '../design-system';

/**
 * WizardHeader Component - Progress indicator for multi-step processes
 */
export const WizardHeader = ({ currentStep, totalSteps, steps = [], className = '' }) => {
  return (
    <div className={`w-full py-4 ${className}`}>
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const stepInfo = steps[index];
          
          return (
            <React.Fragment key={stepNumber}>
              <div className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm
                  ${isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isActive 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {isCompleted ? '✓' : stepNumber}
                </div>
                {stepInfo && (
                  <div className="ml-3">
                    <Typography 
                      variant="caption" 
                      color={isActive ? 'primary' : 'secondary'}
                      className="font-medium"
                    >
                      {stepInfo.title}
                    </Typography>
                    {stepInfo.description && (
                      <Typography variant="small" color="muted">
                        {stepInfo.description}
                      </Typography>
                    )}
                  </div>
                )}
              </div>
              
              {stepNumber < totalSteps && (
                <div className={`
                  flex-1 h-0.5 mx-4
                  ${stepNumber < currentStep ? 'bg-green-500' : 'bg-gray-200'}
                `} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

/**
 * SectionCard Component - Enhanced card for selectable sections
 */
export const SectionCard = ({
  title,
  description,
  isSelected = false,
  isEssential = false,
  estimatedPages,
  icon,
  onToggle,
  disabled = false,
  className = '',
  ...props
}) => {
  const handleClick = () => {
    if (!disabled && onToggle) {
      onToggle();
    }
  };

  return (
    <Card
      className={`
        cursor-pointer transition-all duration-200 border-2
        ${isSelected 
          ? 'border-primary-500 bg-primary-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        ${className}
      `}
      onClick={handleClick}
      {...props}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`
              w-5 h-5 rounded border-2 flex items-center justify-center
              ${isSelected 
                ? 'border-primary-500 bg-primary-500' 
                : 'border-gray-300'
              }
            `}>
              {isSelected && <span className="text-white text-xs">✓</span>}
            </div>
            
            <div className="flex items-center space-x-2">
              {icon && <span className="text-gray-500">{icon}</span>}
              <Typography variant="subtitle2" className="font-semibold">
                {title}
              </Typography>
              {isEssential && (
                <Badge variant="primary" size="sm">Essential</Badge>
              )}
            </div>
          </div>
          
          {estimatedPages && (
            <Typography variant="small" color="muted" className="font-medium">
              {estimatedPages} pages
            </Typography>
          )}
        </div>
        
        <Typography variant="caption" color="secondary" className="leading-relaxed">
          {description}
        </Typography>
      </div>
    </Card>
  );
};

/**
 * SmartConfiguration Component - Adaptive settings based on audience
 */
export const SmartConfiguration = ({
  audience,
  onAudienceChange,
  settings,
  onSettingsChange,
  className = ''
}) => {
  const audiencePresets = {
    stakeholders: {
      label: 'Stakeholders & Decision Makers',
      description: 'Executive summaries with clear action items',
      icon: '👥',
      defaultSections: ['executiveSummary', 'recommendedActions'],
      format: 'executive'
    },
    technical: {
      label: 'Technical/Medical Professionals',
      description: 'Detailed analysis with methodology and data',
      icon: '🔬',
      defaultSections: ['methodology', 'rootCauseAnalysis', 'supportingData'],
      format: 'comprehensive'
    },
    community: {
      label: 'Community Leaders',
      description: 'Community-focused insights and local context',
      icon: '🏘️',
      defaultSections: ['executiveSummary', 'recommendedActions', 'supportingData'],
      format: 'presentation'
    },
    funding: {
      label: 'Funding Organizations',
      description: 'Impact metrics and cost-benefit analysis',
      icon: '💰',
      defaultSections: ['executiveSummary', 'riskAssessment', 'recommendedActions'],
      format: 'comprehensive'
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Audience Selection */}
      <div>
        <Typography variant="h4" className="mb-3">Target Audience</Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(audiencePresets).map(([key, preset]) => (
            <Card
              key={key}
              className={`
                cursor-pointer transition-all duration-200 border-2
                ${audience === key 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => onAudienceChange(key)}
              padding="md"
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{preset.icon}</span>
                <div className="flex-1">
                  <Typography variant="subtitle2" className="font-semibold mb-1">
                    {preset.label}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    {preset.description}
                  </Typography>
                </div>
                {audience === key && (
                  <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Format and Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Typography variant="subtitle1" className="mb-3">Report Format</Typography>
          <select
            value={settings.format}
            onChange={(e) => onSettingsChange({ ...settings, format: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="executive">Executive Brief</option>
            <option value="comprehensive">Comprehensive Report</option>
            <option value="technical">Technical Analysis</option>
            <option value="presentation">Presentation Ready</option>
          </select>
        </div>
        
        <div>
          <Typography variant="subtitle1" className="mb-3">Confidentiality</Typography>
          <select
            value={settings.confidentialityLevel}
            onChange={(e) => onSettingsChange({ ...settings, confidentialityLevel: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="public">Public</option>
            <option value="internal">Internal Use</option>
            <option value="restricted">Restricted</option>
            <option value="confidential">Confidential</option>
          </select>
        </div>
      </div>
      
      {/* Advanced Options */}
      <div>
        <Typography variant="subtitle1" className="mb-3">Content Options</Typography>
        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.includeCharts}
              onChange={(e) => onSettingsChange({ ...settings, includeCharts: e.target.checked })}
              className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
            <Typography variant="caption">Include Charts & Visualizations</Typography>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.includeRawData}
              onChange={(e) => onSettingsChange({ ...settings, includeRawData: e.target.checked })}
              className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
            <Typography variant="caption">Include Raw Data Tables</Typography>
          </label>
        </div>
      </div>
    </div>
  );
};

/**
 * GenerationPreview Component - Live preview of document structure
 */
export const GenerationPreview = ({
  selectedSections,
  estimatedPages,
  estimatedReadTime,
  areaName,
  className = ''
}) => {
  const readTime = Math.ceil(estimatedPages * 2); // Estimate 2 minutes per page

  return (
    <Card className={`${className}`} padding="lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Typography variant="h4">Document Preview</Typography>
          <Badge variant="info" size="md">
            {estimatedPages} pages • ~{readTime} min read
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div className="border-b border-gray-200 pb-2">
            <Typography variant="subtitle1" className="font-semibold">
              Diabetes Risk Evidence Package
            </Typography>
            <Typography variant="caption" color="secondary">
              {areaName}
            </Typography>
          </div>
          
          {Object.entries(selectedSections).map(([sectionId, isSelected]) => {
            if (!isSelected) return null;
            
            const sectionTitles = {
              executiveSummary: 'Executive Summary',
              riskAssessment: 'Risk Assessment',
              rootCauseAnalysis: 'Root Cause Analysis',
              recommendedActions: 'Recommended Actions',
              supportingData: 'Supporting Data',
              methodology: 'Methodology',
              appendices: 'Appendices'
            };
            
            return (
              <div key={sectionId} className="flex items-center space-x-2 py-1">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <Typography variant="caption">
                  {sectionTitles[sectionId]}
                </Typography>
              </div>
            );
          })}
        </div>
        
        <div className="pt-3 border-t border-gray-200">
          <Typography variant="small" color="muted">
            Document will be generated in PDF format with professional styling
          </Typography>
        </div>
      </div>
    </Card>
  );
};

export default {
  WizardHeader,
  SectionCard,
  SmartConfiguration,
  GenerationPreview
};
