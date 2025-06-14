import React, { useState } from 'react';
import './App.css';
import Map from './Map';
import Sidebar from './Sidebar';

function App() {
  const [selectedArea, setSelectedArea] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);

  return (
    <div className="app-container">
      <Map setSelectedArea={setSelectedArea} setIsLoading={setIsLoading} setAiSummary={setAiSummary} />
      <Sidebar selectedArea={selectedArea} isLoading={isLoading} aiSummary={aiSummary} />
    </div>
  );
}

export default App;
