import React from 'react';
import { createPortal } from 'react-dom';

const DataPopover = ({ data, position, visible, onClose }) => {
  if (!visible || !data) {
    return null;
  }

  // Extract relevant raw data properties
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
    // Include other raw data properties as needed
  } = data.properties;

  return createPortal(
    <div
      className="fixed z-50 bg-white p-4 rounded-lg shadow-lg border border-gray-200"
      style={{ top: position.y, left: position.x }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">Data for Zip Code: {zip_code}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <table className="table-auto text-sm">
        <tbody>
          <tr><td className="font-semibold pr-2">Risk Score:</td><td>{RiskScore != null ? RiskScore.toFixed(2) : 'N/A'}</td></tr>
          <tr><td className="font-semibold pr-2">Diabetes Prevalence:</td><td>{DIABETES_CrudePrev != null ? DIABETES_CrudePrev.toFixed(2) : 'N/A'}%</td></tr>
          <tr><td className="font-semibold pr-2">Obesity Prevalence:</td><td>{OBESITY_CrudePrev != null ? OBESITY_CrudePrev.toFixed(2) : 'N/A'}%</td></tr>
          <tr><td className="font-semibold pr-2">Physical Activity:</td><td>{LPA_CrudePrev != null ? LPA_CrudePrev.toFixed(2) : 'N/A'}%</td></tr>
          <tr><td className="font-semibold pr-2">Current Smoking:</td><td>{CSMOKING_CrudePrev != null ? CSMOKING_CrudePrev.toFixed(2) : 'N/A'}%</td></tr>
          <tr><td className="font-semibold pr-2">High Blood Pressure:</td><td>{BPHIGH_CrudePrev != null ? BPHIGH_CrudePrev.toFixed(2) : 'N/A'}%</td></tr>
          <tr><td className="font-semibold pr-2">Food Insecurity:</td><td>{FOODINSECU_CrudePrev != null ? FOODINSECU_CrudePrev.toFixed(2) : 'N/A'}%</td></tr>
          <tr><td className="font-semibold pr-2">Healthcare Access:</td><td>{ACCESS2_CrudePrev != null ? ACCESS2_CrudePrev.toFixed(2) : 'N/A'}%</td></tr>
          {/* Add more data points as needed */}
        </tbody>
      </table>
    </div>,
    document.body
  );
};

export default DataPopover;
