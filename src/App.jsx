import React, { useState } from 'react';
import './App.css';
import Dashboard from "./components/Dashboard";
import SideBySideDashboard from "./components/SideBySideDashboard";
import TopBar from "./components/TopBar";

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
            setSearchPopupData
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
