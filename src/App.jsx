import React, { useState } from 'react';
import './App.css';
import Dashboard from "./components/Dashboard";
import TopBar from "./components/TopBar";

function App() {
  const [selectedArea, setSelectedArea] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);

  return (
    <div className="app-container">
      <TopBar
        setSelectedArea={setSelectedArea}
        setIsLoading={setIsLoading}
        setAiSummary={setAiSummary}
      />
      <div className="content-container">
        <Dashboard
          mapProps={{
            setSelectedArea: setSelectedArea,
            setIsLoading: setIsLoading,
            setAiSummary: setAiSummary
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
