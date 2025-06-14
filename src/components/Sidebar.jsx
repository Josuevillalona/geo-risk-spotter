import React from 'react';

const Sidebar = ({ selectedArea, isLoading, aiSummary }) => {
  if (!selectedArea) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="dashboard-ai-content">
        <h3>Loading AI Summary...</h3>
        <p>Please wait while the AI analyzes the data.</p>
      </div>
    );
  }

  if (aiSummary) {
    return (
      <div className="dashboard-ai-content">
        <p className="ai-summary">{aiSummary}</p>
      </div>
    );
  }

  return null;
};

export default Sidebar;
