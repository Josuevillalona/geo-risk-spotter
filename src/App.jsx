import React, { useState } from 'react';
import './App.css';
import Dashboard from "./components/Dashboard";
import TopBar from "./components/TopBar";

function App() {
  const [selectedArea, setSelectedArea] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [mapMoveEvent, setMapMoveEvent] = useState(null); // New state for map move event

  // Function to trigger map move
  const triggerMapMove = () => {
    setMapMoveEvent({}); // Update state to trigger effect in Map
  };

  return (
    <div className="app-container">
      <TopBar
        setSelectedArea={setSelectedArea}
        setIsLoading={setIsLoading}
        setAiSummary={setAiSummary}
        triggerMapMove={triggerMapMove} // Pass triggerMapMove to TopBar
      />
      <div className="content-container">
        <Dashboard
          mapProps={{
            selectedArea: selectedArea, // Pass selectedArea to mapProps
            setSelectedArea: setSelectedArea,
            setIsLoading: setIsLoading,
            setAiSummary: setAiSummary,
            mapMoveEvent: mapMoveEvent // Pass mapMoveEvent to mapProps
          }}
          sidebarProps={{
            selectedArea,
            isLoading,
            aiSummary
          }}
        />
      </div>
    </div>
  );
}

export default App;
