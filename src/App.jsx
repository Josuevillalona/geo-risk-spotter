import { useState } from 'react';
import Map from './Map';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import React, { useState } from 'react';
import './App.css';
import Map from './Map';
import Sidebar from './Sidebar';

function App() {
  const [selectedArea, setSelectedArea] = useState(null);

  return (
    <div className="app-container">
      <Map setSelectedArea={setSelectedArea} />
      <Sidebar selectedArea={selectedArea} />
    </div>
  );
}

export default App;
