import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from "./components/Dashboard";
import SideBySideDashboard from "./components/SideBySideDashboard";
import TopBar from "./components/TopBar";
import { useAppStore } from './store';
import { aggregateBoroughData, loadBoroughBoundaries, preloadCriticalData } from './services/boroughService';

function App() {
  const [selectedArea, setSelectedArea] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [mapMoveEvent, setMapMoveEvent] = useState(null);
  
  // Search popup state
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [searchPopupData, setSearchPopupData] = useState(null);
  
  // Feature flag for new layout - default to insights-first
  const [useInsightsFirstLayout, setUseInsightsFirstLayout] = useState(true);

  // Get borough data setter from store
  const { 
    setBoroughData, 
    setBoroughBoundaries, 
    setIsBoroughDataLoading, 
    setIsBoroughBoundariesLoading,
    setIsZipCodeDataLoading
  } = useAppStore();

  // Initialize borough data on app load with optimized parallel loading
  useEffect(() => {
    const loadAllBoroughData = async () => {
      // Set loading states for all data types
      setIsBoroughDataLoading(true);
      setIsBoroughBoundariesLoading(true);
      setIsZipCodeDataLoading(true);

      try {
        console.log('🚀 Starting critical data preload...');
        const preloadResults = await preloadCriticalData();

        // Handle boundaries
        if (preloadResults.boundaries) {
          setBoroughBoundaries(preloadResults.boundaries);
          console.log('✅ Borough boundaries set from preload');
        }

        // Handle health data
        if (preloadResults.healthData) {
          const boroughData = aggregateBoroughData(preloadResults.healthData.features);
          setBoroughData(boroughData);
          console.log('✅ Borough health data aggregated and set');
        }

        // Log any errors but don't fail completely
        if (preloadResults.errors.length > 0) {
          console.warn('⚠️ Some data failed to preload:', preloadResults.errors);
        }

      } catch (error) {
        console.error('Critical data loading failed, falling back to individual loads:', error);
        
        // Fallback to individual loading if preload fails completely
        await Promise.allSettled([
          loadBoroughHealthDataFallback(),
          loadBoroughBoundariesDataFallback()
        ]);
      } finally {
        setIsBoroughDataLoading(false);
        setIsBoroughBoundariesLoading(false);
        setIsZipCodeDataLoading(false);
      }
    };

    const loadBoroughHealthDataFallback = async () => {
      try {
        console.log('Loading health data (fallback)...');
        const response = await fetch('/ny_new_york_zip_codes_geo.min.json');
        const fallbackData = await response.json();
        const boroughData = aggregateBoroughData(fallbackData.features);
        setBoroughData(boroughData);
        console.log('Borough data initialized from local fallback');
      } catch (fallbackError) {
        console.error('Failed to load borough data from fallback:', fallbackError);
      }
    };

    const loadBoroughBoundariesDataFallback = async () => {
      try {
        console.log('Loading borough boundaries (fallback)...');
        const boundaries = await loadBoroughBoundaries();
        setBoroughBoundaries(boundaries);
        console.log('Borough boundaries loaded from fallback');
      } catch (error) {
        console.error('Error loading borough boundaries from fallback:', error);
      }
    };

    loadAllBoroughData();
  }, [setBoroughData, setBoroughBoundaries, setIsBoroughDataLoading, setIsBoroughBoundariesLoading, setIsZipCodeDataLoading]);

  // Function to trigger map move
  const triggerMapMove = () => {
    setMapMoveEvent({});
  };

  // Function to show search popup
  const showSearchResultPopup = (zipCode, feature) => {
    setSearchPopupData({ zipCode, feature });
    setShowSearchPopup(true);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowSearchPopup(false);
      setSearchPopupData(null);
    }, 5000);
  };

  return (
    <div className="app-container">
      <TopBar
        setSelectedArea={setSelectedArea}
        setIsLoading={setIsLoading}
        setAiSummary={setAiSummary}
        triggerMapMove={triggerMapMove}
        useInsightsFirstLayout={useInsightsFirstLayout}
        setUseInsightsFirstLayout={setUseInsightsFirstLayout}
        showSearchResultPopup={showSearchResultPopup}
      />
      {useInsightsFirstLayout ? (
        <SideBySideDashboard
          mapProps={{
            selectedArea,
            setSelectedArea,
            setIsLoading,
            setAiSummary,
            mapMoveEvent,
            showSearchPopup,
            searchPopupData,
            setSearchPopupData,
            setShowSearchPopup,
            triggerMapMove
          }}
          sidebarProps={{
            selectedArea,
            isLoading,
            aiSummary
          }}
        />
      ) : (
        <Dashboard
          mapProps={{
            selectedArea,
            setSelectedArea,
            setIsLoading,
            setAiSummary,
            mapMoveEvent,
            showSearchPopup,
            searchPopupData,
            setSearchPopupData
          }}
          sidebarProps={{
            selectedArea,
            isLoading,
            aiSummary
          }}
        />
      )}
    </div>
  );
}

export default App;
