import { useState } from 'react';
import RelevanceBar from './common/RelevanceBar';

const EnhancedInterventionDisplay = ({ selectedArea, isLoading, setIsLoading }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://geo-risk-spotter.onrender.com' 
    : 'http://localhost:8000';

  const fetchEnhancedRecommendations = async () => {
    if (!selectedArea) {
      setError('Please select an area on the map first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/recommendations/enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          health_data: selectedArea.properties,
          question_type: "lifestyle_interventions"
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      setShowDetails(true);
    } catch (error) {
      console.error('Enhanced recommendations error:', error);
      setError('Failed to fetch enhanced recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const InterventionCard = ({ intervention, index }) => {
    const [expanded, setExpanded] = useState(false);
    const relevance = intervention.relevance_score || 0;
    const scoring = intervention.scoring || {};

    // Color based on relevance score
    const getRelevanceColor = (score) => {
      if (score >= 0.8) return '#10b981'; // Green
      if (score >= 0.6) return '#f59e0b'; // Yellow
      if (score >= 0.4) return '#ef4444'; // Red
      return '#6b7280'; // Gray
    };

    const getCostColor = (cost) => {
      switch (cost?.toLowerCase()) {
        case 'low': return '#10b981';
        case 'medium': return '#f59e0b';
        case 'high': return '#ef4444';
        default: return '#6b7280';
      }
    };

    const getEvidenceColor = (evidence) => {
      switch (evidence?.toLowerCase()) {
        case 'high': return '#10b981';
        case 'medium': return '#f59e0b';
        case 'low': return '#ef4444';
        default: return '#6b7280';
      }
    };

    return (
      <div className="intervention-card">
        {/* Header */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '0.5rem'
          }}>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0,
              flex: 1,
              paddingRight: '0.5rem'
            }}>
              {index + 1}. {intervention.title}
            </h4>
            <span style={{
              backgroundColor: getRelevanceColor(relevance),
              color: 'white',
              padding: '0.375rem 0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: '700',
              whiteSpace: 'nowrap',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {(relevance * 100).toFixed(0)}% Match
            </span>
          </div>

          {/* Category and tags */}
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '0.5rem'
          }}>
            <span style={{
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              {intervention.category}
            </span>
            
            {intervention.implementation_cost && (
              <span style={{
                backgroundColor: '#f3f4f6',
                color: getCostColor(intervention.implementation_cost),
                padding: '0.25rem 0.5rem',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                💰 {intervention.implementation_cost} cost
              </span>
            )}

            {intervention.evidence_level && (
              <span style={{
                backgroundColor: '#f3f4f6',
                color: getEvidenceColor(intervention.evidence_level),
                padding: '0.25rem 0.5rem',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                📊 {intervention.evidence_level} evidence
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '0.875rem',
          color: '#374151',
          lineHeight: '1.5',
          margin: '0 0 0.75rem 0'
        }}>
          {intervention.description}
        </p>

        {/* Enhanced Scoring Display */}
        {scoring && Object.keys(scoring).length > 0 && (
          <div className="enhanced-scoring">
            <div className="scoring-header">
              🎯 Phase B Enhanced RAG Scoring
              <span style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: '500'
              }}>
                BETA
              </span>
            </div>
            
            <div className="scoring-bars">
              <RelevanceBar 
                score={scoring.vector_score || 0} 
                label="🔍 Vector Similarity" 
                color="bg-purple-500" 
              />
              <RelevanceBar 
                score={scoring.keyword_score || 0} 
                label="🔑 Health Keywords" 
                color="bg-cyan-500" 
              />
              <RelevanceBar 
                score={scoring.context_score || 0} 
                label="🎯 Implementation Context" 
                color="bg-emerald-500" 
              />
            </div>
            
            <div style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  Overall Relevance Score
                </span>
                <span style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: getRelevanceColor(relevance),
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  {(relevance * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#6b7280',
                fontStyle: 'italic'
              }}>
                Calculated using hybrid vector + keyword + context analysis
              </div>
            </div>
          </div>
        )}

        {/* Additional details toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            width: '100%',
            padding: '0.5rem',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.75rem',
            color: '#374151',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
        >
          {expanded ? '▲ Hide Details' : '▼ Show Details'}
        </button>

        {/* Expanded details */}
        {expanded && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.75rem',
            backgroundColor: '#fafbfc',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            {intervention.target_population && (
              <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '0.75rem', color: '#1f2937' }}>Target Population:</strong>
                <span style={{ fontSize: '0.75rem', color: '#374151', marginLeft: '0.5rem' }}>
                  {intervention.target_population.replace(/_/g, ' ')}
                </span>
              </div>
            )}
            
            {intervention.timeframe && (
              <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '0.75rem', color: '#1f2937' }}>Timeframe:</strong>
                <span style={{ fontSize: '0.75rem', color: '#374151', marginLeft: '0.5rem' }}>
                  {intervention.timeframe}
                </span>
              </div>
            )}
            
            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
              💡 This intervention was selected using Phase B Enhanced RAG with vector similarity, 
              keyword matching, and health context analysis.
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Enhanced Recommendations Button */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={fetchEnhancedRecommendations}
          disabled={isLoading || !selectedArea}
          className="enhanced-rag-button"
          style={{
            width: '100%',
            padding: '0.875rem 1rem',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: selectedArea ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}
        >
          {isLoading ? (
            <>
              <div style={{
                width: '1.25rem',
                height: '1.25rem',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#ffffff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Analyzing with Enhanced RAG...
            </>
          ) : (
            <>
              🚀 Get Phase B Enhanced Recommendations
            </>
          )}
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Results display */}
      {showDetails && recommendations.length > 0 && (
        <div>
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '2px solid #bbf7d0',
            color: '#166534',
            padding: '1rem',
            borderRadius: '0.75rem',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>🎯</span>
              <span style={{ fontWeight: '700' }}>
                Phase B Enhanced RAG Analysis Complete!
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#15803d', lineHeight: '1.4' }}>
              Found <strong>{recommendations.length} highly relevant recommendations</strong> using:
              <br />
              • 🔍 <strong>Vector similarity</strong> - semantic understanding of health contexts
              <br />
              • 🔑 <strong>Keyword matching</strong> - targeted health condition analysis  
              <br />
              • 🎯 <strong>Implementation scoring</strong> - feasibility and evidence-based ranking
            </div>
          </div>

          {recommendations.map((intervention, index) => (
            <InterventionCard 
              key={intervention.title || index} 
              intervention={intervention} 
              index={index} 
            />
          ))}
        </div>
      )}

      {showDetails && recommendations.length === 0 && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #fcd34d',
          color: '#92400e',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          fontSize: '0.875rem'
        }}>
          ℹ️ No enhanced recommendations found for this area.
        </div>
      )}
    </div>
  );
};

export default EnhancedInterventionDisplay;
