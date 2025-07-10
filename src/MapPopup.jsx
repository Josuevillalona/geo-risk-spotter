import React from 'react';

// Helper functions for metrics and risk
const formatPercent = (value) => {
  if (value === undefined || value === null || value === '') return '0.0%';
  const num = Number(value);
  if (isNaN(num)) return '0.0%';
  return `${num.toFixed(1)}%`;
};

const getRiskLevel = (score) => {
  if (score >= 20) return { level: 'high', color: '#dc2626', icon: '🔴' };
  if (score >= 15) return { level: 'medium-high', color: '#f59e0b', icon: '🟠' };
  if (score >= 10) return { level: 'medium', color: '#eab308', icon: '🟡' };
  return { level: 'low', color: '#16a34a', icon: '🟢' };
};

const getMetricRisk = (value, type) => {
  const num = Number(value) || 0;
  if (type === 'diabetes') {
    if (num >= 12) return { color: '#dc2626', icon: '🔴' };
    if (num >= 8) return { color: '#f59e0b', icon: '🟠' };
    return { color: '#16a34a', icon: '🟢' };
  }
  if (type === 'obesity') {
    if (num >= 30) return { color: '#dc2626', icon: '🔴' };
    if (num >= 25) return { color: '#f59e0b', icon: '🟠' };
    return { color: '#16a34a', icon: '🟢' };
  }
  return { color: '#6b7280', icon: '⚪' };
};

/**
 * MapPopup: Shows metrics for a selected zip code on the map.
 * Props: clickedZipCode, selectedFeature, clickPosition
 */
const MapPopup = ({ clickedZipCode, selectedFeature, clickPosition }) => {
  if (!clickedZipCode || !selectedFeature) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: `${clickPosition.x}px`,
        top: `${clickPosition.y - 120}px`,
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: 1000,
        border: '1px solid #e5e7eb',
        pointerEvents: 'none',
        transform: 'translateX(-50%)',
        minWidth: '280px',
        maxWidth: '320px',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f8fafc',
        borderRadius: '8px 8px 0 0',
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          📍 Zip Code {clickedZipCode}
        </div>
      </div>

      {/* Metrics */}
      <div style={{ padding: '16px' }}>
        {/* Risk Score */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          padding: '8px 12px',
          backgroundColor: '#f9fafb',
          borderRadius: '6px',
        }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
            Risk Score:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '16px',
              fontWeight: '600',
              color: getRiskLevel(selectedFeature.properties.RiskScore).color,
            }}>
              {selectedFeature.properties.RiskScore?.toFixed(1) || 'N/A'}
            </span>
            <span>{getRiskLevel(selectedFeature.properties.RiskScore).icon}</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>
              Diabetes:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: getMetricRisk(selectedFeature.properties.DIABETES_CrudePrev, 'diabetes').color,
              }}>
                {formatPercent(selectedFeature.properties.DIABETES_CrudePrev)}
              </span>
              <span style={{ fontSize: '12px' }}>
                {getMetricRisk(selectedFeature.properties.DIABETES_CrudePrev, 'diabetes').icon}
              </span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>
              Obesity:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: getMetricRisk(selectedFeature.properties.OBESITY_CrudePrev, 'obesity').color,
              }}>
                {formatPercent(selectedFeature.properties.OBESITY_CrudePrev)}
              </span>
              <span style={{ fontSize: '12px' }}>
                {getMetricRisk(selectedFeature.properties.OBESITY_CrudePrev, 'obesity').icon}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Arrow */}
      <div
        style={{
          position: 'absolute',
          bottom: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '0',
          height: '0',
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid white',
        }}
      />
    </div>
  );
};

export default MapPopup;
