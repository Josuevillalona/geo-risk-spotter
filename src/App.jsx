import React, { useState } from 'react';
import './App.css';
import Dashboard from "./components/Dashboard";
import TopBar from "./components/TopBar";

function App() {
  const [selectedArea, setSelectedArea] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [mapMoveEvent, setMapMoveEvent] = useState(null);

  // Function to trigger map move
  const triggerMapMove = () => {
    setMapMoveEvent({});
  };

  return (
    <div className="app-container">
      <TopBar
        setSelectedArea={setSelectedArea}
        setIsLoading={setIsLoading}
        setAiSummary={setAiSummary}
        triggerMapMove={triggerMapMove}
      />
      <div className="content-container">
        <Dashboard
          mapProps={{
            selectedArea,
            setSelectedArea,
            setIsLoading,
            setAiSummary,
            mapMoveEvent
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
