import React from 'react';

/**
 * RelevanceBar: Animated progress bar component for displaying scores and metrics.
 * Features shimmer animation and Tailwind CSS styling.
 * 
 * @param {number} score - Score value between 0 and 1
 * @param {string} label - Label text for the bar
 * @param {string} color - Tailwind color class for the filled portion
 * @param {string} maxWidth - Tailwind width class (default: 'w-full')
 */
const RelevanceBar = ({ score, label, color = 'bg-blue-500', maxWidth = 'w-full' }) => (
  <div className="mb-2">
    <div className="flex justify-between items-center mb-1">
      <span className="text-xs font-medium text-gray-600">
        {label}
      </span>
      <span className="text-xs font-semibold text-gray-800">
        {(score * 100).toFixed(1)}%
      </span>
    </div>
    <div className={`${maxWidth} h-2 bg-gray-200 rounded overflow-hidden relative`}>
      <div 
        className={`h-full ${color} rounded transition-all duration-500 ease-in-out relative`}
        style={{ width: `${score * 100}%` }}
      >
        {/* Shimmer effect for visual appeal */}
        <div 
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent ${
            score > 0 ? 'animate-shimmer' : ''
          }`}
        />
      </div>
    </div>
  </div>
);

export default RelevanceBar;
