import React from 'react';
import Chatbot from './Chatbot';

const RecommendationsTab = ({ selectedArea, enhanced = true }) => {
  return (
    <div className="recommendations-container">
      <Chatbot selectedArea={selectedArea} enhanced={enhanced} />
    </div>
  );
};

export default RecommendationsTab;
