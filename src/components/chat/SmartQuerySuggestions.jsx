import React, { useMemo } from 'react';
import { useAppStore } from '../../store';
import { generateContextualSuggestions } from '../../services/chatService';
import { MdPsychology, MdCompare, MdAnalytics, MdLocationOn } from 'react-icons/md';

const SmartQuerySuggestions = ({ onQuerySelect, isLoading }) => {
  const { viewMode, selectedBorough, selectedArea, boroughData } = useAppStore();

  // Generate contextual suggestions based on current state
  const suggestions = useMemo(() => {
    const context = { viewMode, selectedBorough, selectedArea, boroughData };
    const contextualSuggestions = generateContextualSuggestions(context);
    
    // Add icons and categories to suggestions
    return contextualSuggestions.map((suggestion, index) => {
      let icon = MdPsychology;
      let category = 'General';
      
      if (suggestion.toLowerCase().includes('compare')) {
        icon = MdCompare;
        category = 'Comparison';
      } else if (suggestion.toLowerCase().includes('analyze') || suggestion.toLowerCase().includes('risk')) {
        icon = MdAnalytics;
        category = 'Analysis';
      } else if (suggestion.toLowerCase().includes('area') || suggestion.toLowerCase().includes('borough')) {
        icon = MdLocationOn;
        category = 'Location';
      }
      
      return {
        id: index,
        text: suggestion,
        icon,
        category
      };
    });
  }, [viewMode, selectedBorough, selectedArea, boroughData]);

  // Get context description
  const contextDescription = useMemo(() => {
    if (viewMode === 'borough' && selectedArea?.properties?.borough) {
      return `${selectedArea.properties.borough} Borough`;
    } else if (selectedBorough !== 'All') {
      return `${selectedBorough} Borough Filter`;
    } else if (selectedArea?.properties) {
      const zipCode = selectedArea.properties.ZCTA5CE10 || selectedArea.properties.zip_code;
      return `ZIP Code ${zipCode}`;
    }
    return 'NYC Overview';
  }, [viewMode, selectedBorough, selectedArea]);

  return (
    <div className="smart-suggestions">
      <div className="suggestions-grid">
        {suggestions.map((suggestion) => {
          const IconComponent = suggestion.icon;
          return (
            <button
              key={suggestion.id}
              className="suggestion-card"
              onClick={() => onQuerySelect(suggestion.text)}
              disabled={isLoading}
              title={`${suggestion.category}: ${suggestion.text}`}
            >
              <div className="suggestion-icon">
                <IconComponent />
              </div>
              <div className="suggestion-content">
                <span className="suggestion-category">{suggestion.category}</span>
                <p className="suggestion-text">{suggestion.text}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SmartQuerySuggestions;
