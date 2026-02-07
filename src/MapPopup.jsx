import React from 'react';
import { FaLayerGroup } from 'react-icons/fa';
import { useAppStore } from './store';

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
 * MapPopup: Shows metrics for a selected zip code or borough on the map.
 * Props: clickedZipCode, selectedFeature, clickPosition, onClose
 */
const MapPopup = ({ clickedZipCode, selectedFeature, clickPosition, onClose }) => {
  const { visualizationMode, clusterData, clusterProfiles } = useAppStore();

  if (!clickedZipCode || !selectedFeature) return null;

  const isBorough = selectedFeature.properties.borough;
  const props = selectedFeature.properties;

  // Get appropriate values based on whether this is a borough or zip code
  const getRiskScore = () => isBorough ? props.avgRiskScore : props.RiskScore;
  const getDiabetesRate = () => isBorough ? props.avgDiabetes : props.DIABETES_CrudePrev;
  const getObesityRate = () => isBorough ? props.avgObesity : props.OBESITY_CrudePrev;

  // Cluster Info
  let clusterInfo = null;
  if (visualizationMode === 'cluster' && !isBorough && clusterData && clusterProfiles) {
    const clusterId = clusterData[clickedZipCode];
    if (clusterId !== undefined) {
      clusterInfo = clusterProfiles.find(p => p.cluster_id === clusterId);
    }
  }

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
        position: 'relative',
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          paddingRight: '24px', // Make room for close button
        }}>
          {isBorough ? '🏙️' : '📍'} {isBorough ? `${clickedZipCode} Borough` : `Zip Code ${clickedZipCode}`}
        </div>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            fontSize: '18px',
            color: '#6b7280',
            cursor: 'pointer',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            pointerEvents: 'auto', // Enable pointer events for the close button
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.color = '#374151'}
          onMouseLeave={(e) => e.target.style.color = '#6b7280'}
          title="Close popup"
        >
          ×
        </button>
        {isBorough && (
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '4px',
          }}>
            {props.zipCodeCount} zip codes included
          </div>
        )}
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
            {isBorough ? 'Average Risk Score:' : 'Risk Score:'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '16px',
              fontWeight: '600',
              color: getRiskLevel(getRiskScore()).color,
            }}>
              {getRiskScore()?.toFixed(1) || 'N/A'}
            </span>
            <span>{getRiskLevel(getRiskScore()).icon}</span>
          </div>
        </div>

        {/* Cluster Info Section */}
        {clusterInfo && (
          <div style={{
            marginBottom: '12px',
            padding: '8px 12px',
            backgroundColor: '#f0fdf4',
            borderRadius: '6px',
            border: '1px solid #bbf7d0',
          }}>
            <div style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              color: '#166534',
              fontWeight: '600',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <FaLayerGroup /> Health Profile
            </div>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#14532d',
              marginBottom: '2px'
            }}>
              {clusterInfo.name}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#15803d',
              lineHeight: '1.4'
            }}>
              {clusterInfo.description}
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>
              {isBorough ? 'Avg. Diabetes:' : 'Diabetes:'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: getMetricRisk(getDiabetesRate(), 'diabetes').color,
              }}>
                {formatPercent(getDiabetesRate())}
              </span>
              <span style={{ fontSize: '12px' }}>
                {getMetricRisk(getDiabetesRate(), 'diabetes').icon}
              </span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>
              {isBorough ? 'Avg. Obesity:' : 'Obesity:'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: getMetricRisk(getObesityRate(), 'obesity').color,
              }}>
                {formatPercent(getObesityRate())}
              </span>
              <span style={{ fontSize: '12px' }}>
                {getMetricRisk(getObesityRate(), 'obesity').icon}
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
