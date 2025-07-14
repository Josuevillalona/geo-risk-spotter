import React from 'react';
import { FaHeartbeat, FaBookmark } from 'react-icons/fa';

const TopBar = ({ useInsightsFirstLayout, setUseInsightsFirstLayout }) => {
  return (
    <div className="bg-white shadow-sm">
      {/* Main header row - White background with logo and button */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '1rem 1rem',
          width: '100%'
        }}
      >
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FaHeartbeat className="text-4xl" style={{ color: '#1d4241' }} aria-hidden="true" />
          <span 
            style={{ 
              color: '#1d4241',
              fontFamily: 'Nunito, sans-serif',
              fontSize: '1.75rem',
              fontWeight: '800',
              letterSpacing: '0.025em'
            }}
          >
            RiskPulse
          </span>
        </div>
        
        {/* Right: Saved Reports Button */}
        <button
          className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-300 hover:border-gray-400 hover:shadow-md rounded-lg transition-all duration-200 font-medium text-sm"
          style={{ color: '#1d4241', marginRight: '1rem' }}
          title="View saved reports"
        >
          <FaBookmark className="text-sm" />
          <span>Saved Reports</span>
        </button>
      </div>
      
      {/* Green ribbon with tagline */}
      <div style={{ backgroundColor: '#1d4241', padding: '0.5rem 0' }}>
        <div style={{ textAlign: 'center', width: '100%' }}>
          <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: '500' }}>
            AI-powered diabetes risk mapping for NYC public health
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;