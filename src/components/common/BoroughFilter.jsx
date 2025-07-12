import React from 'react';
import { useAppStore } from '../../store';
import { NYC_BOROUGHS } from '../../services/boroughService';

const BoroughFilter = ({ className = "" }) => {
  const { 
    selectedBorough, 
    setSelectedBorough, 
    viewMode, 
    setViewMode,
    boroughData 
  } = useAppStore();
  
  const boroughs = ['All', ...Object.keys(NYC_BOROUGHS)];
  
  // Get summary stats for current selection
  const getSummaryStats = () => {
    if (selectedBorough === 'All' && boroughData) {
      const allBoroughs = Object.values(boroughData);
      const avgDiabetes = allBoroughs.reduce((sum, b) => sum + b.diabetes_avg, 0) / allBoroughs.length;
      return {
        areas: allBoroughs.reduce((sum, b) => sum + b.zipCodeCount, 0),
        avgMetric: avgDiabetes.toFixed(1)
      };
    } else if (boroughData && boroughData[selectedBorough]) {
      const borough = boroughData[selectedBorough];
      return {
        areas: borough.zipCodeCount,
        avgMetric: borough.diabetes_avg.toFixed(1)
      };
    }
    return null;
  };

  const summaryStats = getSummaryStats();

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Borough Selection */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Borough:
        </label>
        <select
          value={selectedBorough}
          onChange={(e) => setSelectedBorough(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
        >
          {boroughs.map(borough => (
            <option key={borough} value={borough}>
              {borough}
            </option>
          ))}
        </select>
      </div>
      
      {/* View Mode Toggle */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          View:
        </label>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('zipcode')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === 'zipcode' 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Zip Codes
          </button>
          <button
            onClick={() => setViewMode('borough')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === 'borough' 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Boroughs
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {summaryStats && (
        <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
          <span className="flex items-center gap-1">
            <span className="font-medium">{summaryStats.areas}</span>
            <span>{viewMode === 'borough' ? 'zip codes' : 'areas'}</span>
          </span>
          <span className="text-gray-400">•</span>
          <span className="flex items-center gap-1">
            <span className="font-medium">{summaryStats.avgMetric}%</span>
            <span>avg diabetes</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default BoroughFilter;
