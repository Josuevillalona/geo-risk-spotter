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
<<<<<<< HEAD
    // Split the summary into paragraphs
    const paragraphs = aiSummary.split('\n\n').filter(p => p.trim());
    
    return (
      <div className="dashboard-ai-content">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="ai-summary-paragraph">
            {paragraph.trim()}
          </p>
        ))}
=======
    return (
      <div className="dashboard-ai-content">
        <p className="ai-summary">{aiSummary}</p>
>>>>>>> 6b9ce304dc1cdd8950782a1cac627dde18698df4
      </div>
    );
  }

  return null;
};

export default Sidebar;
