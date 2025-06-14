import React, { useState } from 'react';
import './App.css';
import Dashboard from "./components/Dashboard";

function App() {
  const [selectedArea, setSelectedArea] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);

  return (
    <Dashboard
      mapProps={{
        selectedArea: selectedArea,
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
  );
}

export default App;
