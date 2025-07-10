import React, { useState } from 'react';
import { useAppStore } from '../../store';

/**
 * SavedAnalysesList: Displays and manages saved diabetes risk analyses.
 * Provides list view with delete functionality and empty state handling.
 */
const SavedAnalysesList = () => {
  const [saveStatus, setSaveStatus] = useState(null);
  const savedAnalyses = useAppStore((state) => state.savedAnalyses);
  const deleteSavedAnalysis = useAppStore((state) => state.deleteSavedAnalysis);

  const handleDelete = (analysisToDelete) => {
    try {
      deleteSavedAnalysis(analysisToDelete);
      setSaveStatus('deleted');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  if (savedAnalyses.length === 0) {
    return (
      <div className="bg-green-50 p-4 rounded-lg text-gray-800 text-center">
        <p className="text-sm text-gray-600">
          No saved analyses yet. Select an area and click "Save Analysis" to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 p-4 rounded-lg text-gray-800">
      <h3 className="text-gray-800 mb-4 font-medium text-base">
        Saved Analyses ({savedAnalyses.length})
      </h3>
      
      {saveStatus === 'deleted' && (
        <div className="mb-4 p-2 bg-blue-50 text-blue-700 text-xs text-center rounded">
          🗑️ Analysis deleted!
        </div>
      )}
      
      {saveStatus === 'error' && (
        <div className="mb-4 p-2 bg-red-50 text-red-700 text-xs text-center rounded">
          ❌ Failed to delete analysis
        </div>
      )}
      
      <div className="max-h-96 overflow-y-auto">
        {savedAnalyses.slice().reverse().map((analysis, index) => (
          <div 
            key={`${analysis.zcta_code}-${analysis.saved_at}`} 
            className="border border-gray-200 rounded-md p-3 mb-2 bg-white"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-sm">
                Zip Code: {analysis.zcta_code}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {new Date(analysis.saved_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(analysis)}
                  className="bg-red-500 hover:bg-red-600 text-white border-none px-2 py-1 rounded text-xs cursor-pointer font-medium transition-colors duration-200"
                  title="Delete this analysis"
                >
                  Delete
                </button>
              </div>
            </div>
            
            {analysis.aiSummary && (
              <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded mt-2 max-h-15 overflow-hidden">
                {analysis.aiSummary.substring(0, 150)}
                {analysis.aiSummary.length > 150 ? '...' : ''}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedAnalysesList;
