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

  // Extract relevant raw data from selectedArea.properties
  const {
    zip_code,
    RiskScore,
    DIABETES_CrudePrev,
    OBESITY_CrudePrev,
    LPA_CrudePrev,
    CSMOKING_CrudePrev,
    BPHIGH_CrudePrev,
    FOODINSECU_CrudePrev,
    ACCESS2_CrudePrev
  } = selectedArea.properties;

  return (
    <div className="sidebar">
      <h2>Data for Zip Code: {zip_code}</h2>
      <p><strong>Risk Score:</strong> {RiskScore != null ? RiskScore.toFixed(2) : 'N/A'}</p>
      <p><strong>Diabetes Crude Prevalence:</strong> {DIABETES_CrudePrev != null ? DIABETES_CrudePrev.toFixed(2) : 'N/A'}%</p>
      <p><strong>Obesity Crude Prevalence:</strong> {OBESITY_CrudePrev != null ? OBESITY_CrudePrev.toFixed(2) : 'N/A'}%</p>
      <p><strong>Lack of Physical Activity Prevalence:</strong> {LPA_CrudePrev != null ? LPA_CrudePrev.toFixed(2) : 'N/A'}%</p>
      <p><strong>Current Smoking Crude Prevalence:</strong> {CSMOKING_CrudePrev != null ? CSMOKING_CrudePrev.toFixed(2) : 'N/A'}%</p>
      <p><strong>High Blood Pressure Crude Prevalence:</strong> {BPHIGH_CrudePrev != null ? BPHIGH_CrudePrev.toFixed(2) : 'N/A'}%</p>
      <p><strong>Food Insecurity Crude Prevalence:</strong> {FOODINSECU_CrudePrev != null ? FOODINSECU_CrudePrev.toFixed(2) : 'N/A'}%</p>
      <p><strong>Limited Access to Healthcare Prevalence:</strong> {ACCESS2_CrudePrev != null ? ACCESS2_CrudePrev.toFixed(2) : 'N/A'}%</p>
      {/* Add more data points as needed */}
    </div>
  );
};

export default Sidebar;
