import React, { useEffect } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useAppStore } from '../store';

/**
 * Borough Boundary Layer Component
 * 
 * Purpose: Provides contextual borough boundaries ONLY in zip code view
 * for Public Health Planners to understand geographic scope and build evidence packages.
 * 
 * Features:
 * - Borough boundaries visible only in zip code view mode for context
 * - Visual distinction between selected and non-selected boroughs  
 * - No conflicts with main borough visualization
 * - Performance optimized with smart re-rendering
 */
const BoroughBoundaryLayer = () => {
  const { 
    selectedBorough, 
    boroughBoundaries, 
    viewMode,
    setBoroughBoundaries,
    setIsBoroughBoundariesLoading 
  } = useAppStore();

  // Load borough boundaries only when in zipcode view and not already loaded
  useEffect(() => {
    // Skip loading if in borough view mode
    if (viewMode === 'borough') return;
    
    const loadBoundaries = async () => {
      if (boroughBoundaries) return; // Already loaded
      
      setIsBoroughBoundariesLoading(true);
      try {
        // Import the loadBoroughBoundaries function
        const { loadBoroughBoundaries } = await import('../services/boroughService');
        const boundaries = await loadBoroughBoundaries();
        setBoroughBoundaries(boundaries);
      } catch (error) {
        console.error('Failed to load borough boundaries:', error);
      } finally {
        setIsBoroughBoundariesLoading(false);
      }
    };

    loadBoundaries();
  }, [viewMode, boroughBoundaries, setBoroughBoundaries, setIsBoroughBoundariesLoading]);

  // Only render boundaries in zip code view to avoid conflicts
  if (viewMode === 'borough') {
    return null;
  }

  // Don't render if boundaries aren't loaded
  if (!boroughBoundaries?.features) {
    return null;
  }

  /**
   * Borough boundary styling function
   * Creates professional, evidence-building visual hierarchy for Public Health Planners
   */
  const getBoundaryStyle = (feature) => {
    const boroughName = feature.properties.borough_name;
    const isSelected = selectedBorough === boroughName;
    const isFiltering = selectedBorough !== 'All';

    // When filtering is active, show clear visual distinction
    if (isFiltering) {
      if (isSelected) {
        // Selected borough: prominent, brand-colored boundary
        return {
          fill: false,
          color: '#1d4241',     // Brand color for selected borough
          weight: 4,            // Thick border for prominence
          dashArray: '0',       // Solid line for selection
          opacity: 0.9,         // High visibility
          interactive: false
        };
      } else {
        // Non-selected boroughs: very subtle, almost invisible
        return {
          fill: false,
          color: '#E5E7EB',     // Very light gray
          weight: 1,            // Thin border
          dashArray: '8,8',     // Long dashes for subtlety
          opacity: 0.3,         // Low visibility
          interactive: false
        };
      }
    }

    // When no filtering (All boroughs): subtle context boundaries
    return {
      fill: false,
      color: '#9CA3AF',       // Medium gray for context
      weight: 2,
      dashArray: '4,6',       // Dashed line for subtlety
      opacity: 0.4,           // Moderate visibility
      interactive: false
    };
  };

  /**
   * Handle borough boundary interactions
   * Provides context-aware tooltips for Public Health Planners
   */
  const onEachFeature = (feature, layer) => {
    const boroughName = feature.properties.borough_name;
    const isSelected = selectedBorough === boroughName;
    const isFiltering = selectedBorough !== 'All';

    // Disable all click events to prevent popup conflicts
    layer.off('click');
    
    // Enhanced tooltip with context for evidence-building
    let tooltipContent;
    if (isFiltering && isSelected) {
      tooltipContent = `<div style="font-weight: 600; color: #1d4241; font-size: 11px;">
        📍 ${boroughName} Borough
        <div style="font-weight: 400; color: #059669; font-size: 10px;">Currently analyzing</div>
      </div>`;
    } else if (isFiltering && !isSelected) {
      tooltipContent = `<div style="font-weight: 500; color: #6B7280; font-size: 11px;">
        ${boroughName} Borough
        <div style="font-weight: 400; color: #9CA3AF; font-size: 10px;">Not in current analysis</div>
      </div>`;
    } else {
      tooltipContent = `<div style="font-weight: 500; color: #1d4241; font-size: 11px;">${boroughName} Borough</div>`;
    }

    layer.bindTooltip(tooltipContent, {
      permanent: false,
      direction: 'center',
      className: 'borough-boundary-tooltip',
      opacity: 0.9
    });

    // Enhanced hover effect based on selection state
    layer.on({
      mouseover: (e) => {
        if (isFiltering && isSelected) {
          // Selected borough: subtle glow effect
          layer.setStyle({ 
            opacity: 1.0,
            weight: 5
          });
        } else if (!isSelected) {
          // Non-selected: slight visibility increase
          layer.setStyle({ opacity: 0.6 });
        }
      },
      mouseout: (e) => {
        layer.setStyle(getBoundaryStyle(feature));
      }
    });
  };

  return (
    <GeoJSON
      key={`borough-boundaries-${selectedBorough}-${viewMode}`} // Force re-render on selection change
      data={boroughBoundaries}
      style={getBoundaryStyle}
      onEachFeature={onEachFeature}
    />
  );
};

export default BoroughBoundaryLayer;
