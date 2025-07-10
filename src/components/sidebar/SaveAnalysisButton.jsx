import React, { useState } from 'react';
import { useAppStore } from '../../store';

/**
 * SaveAnalysisButton: Handles saving current analysis with user feedback.
 * Provides visual feedback and error handling for save operations.
 * 
 * @param {Object} selectedArea - Currently selected map area data
 * @param {Object} aiSummary - AI analysis summary data  
 * @param {boolean} isLoading - Whether analysis is currently loading
 */
const SaveAnalysisButton = ({ selectedArea, aiSummary, isLoading }) => {
  const [saveStatus, setSaveStatus] = useState(null);
  const saveCurrentAnalysis = useAppStore((state) => state.saveCurrentAnalysis);

  const handleSave = () => {
    try {
      saveCurrentAnalysis({
        selectedArea,
        aiSummary,
        chatHistory: [] // Default empty for now
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const getStatusMessage = () => {
    switch (saveStatus) {
      case 'success':
        return '✅ Analysis saved!';
      case 'error':
        return '❌ Failed to save';
      case 'deleted':
        return '🗑️ Analysis deleted!';
      default:
        return null;
    }
  };

  const getButtonText = () => {
    if (saveStatus === 'success') return 'Saved!';
    if (saveStatus === 'error') return 'Error';
    return 'Save Analysis';
  };

  const isDisabled = !selectedArea || isLoading || saveStatus === 'success';

  return (
    <div className="mb-4">
      <button
        onClick={handleSave}
        disabled={isDisabled}
        className={`
          w-full px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
          ${isDisabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md'
          }
          ${saveStatus === 'success' ? 'bg-green-600' : ''}
          ${saveStatus === 'error' ? 'bg-red-500 text-white' : ''}
        `}
      >
        {getButtonText()}
      </button>
      
      {saveStatus && (
        <div className={`
          mt-2 p-2 text-xs text-center rounded transition-all duration-200
          ${saveStatus === 'success' ? 'bg-green-50 text-green-700' : ''}
          ${saveStatus === 'error' ? 'bg-red-50 text-red-700' : ''}
          ${saveStatus === 'deleted' ? 'bg-blue-50 text-blue-700' : ''}
        `}>
          {getStatusMessage()}
        </div>
      )}
    </div>
  );
};

export default SaveAnalysisButton;
