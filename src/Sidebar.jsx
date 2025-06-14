import React from 'react';

const Sidebar = ({ selectedArea, isLoading, aiSummary }) => {
  if (!selectedArea) {
    return null; // Don't render sidebar if no area is selected
  }

  if (isLoading) {
    return (
      <div className="sidebar">
        <h2>Loading AI Summary...</h2>
        <p>Please wait while the AI analyzes the data.</p>
      </div>
    );
  }

  if (aiSummary) {
    return (
      <div className="sidebar">
        <h2>AI Summary for Zip Code: {selectedArea.properties.zip_code}</h2>
        <p>{aiSummary}</p>
      </div>
    );
  }

  return null; // Render nothing if no area selected, not loading, and no AI summary
};

export default Sidebar;
