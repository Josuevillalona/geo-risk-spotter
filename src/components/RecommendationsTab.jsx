import React from 'react';
import Chatbot from './Chatbot';

const RecommendationsTab = ({ selectedArea }) => {
  return (
    <div className="recommendations-container">
      <Chatbot selectedArea={selectedArea} />
    </div>
  );
};

export default RecommendationsTab;
