// Enhanced chat service with borough-aware intelligence
import { useAppStore } from '../store';

/**
 * Natural language query templates for borough and zip code analysis
 */
export const QUERY_TEMPLATES = {
  borough: {
    comparison: [
      "Compare {borough} to other NYC boroughs for diabetes risk",
      "How does {borough} rank among NYC boroughs for health metrics?",
      "Show me {borough}'s strengths and weaknesses compared to other boroughs"
    ],
    analysis: [
      "Analyze the diabetes risk patterns in {borough}",
      "What are the main health challenges in {borough}?",
      "Summarize {borough}'s health profile"
    ],
    interventions: [
      "What interventions would work best for {borough}?",
      "Recommend community programs for {borough}",
      "How can {borough} improve its diabetes prevention efforts?"
    ]
  },
  zipcode: [
    "What intervention programs would work best for this area?",
    "What are the main health risk factors here?",
    "How does this area compare to nearby zip codes?",
    "What can residents do to reduce diabetes risk?"
  ],
  general: [
    "Show me boroughs with the highest diabetes rates",
    "Which NYC borough has the best health outcomes?",
    "Compare diabetes rates across all boroughs",
    "Find areas with high food insecurity",
    "Show neighborhoods with poor healthcare access"
  ]
};

/**
 * Generate contextual query suggestions based on current view
 * @param {Object} context - Current app context
 * @returns {Array} - Array of suggested queries
 */
export const generateContextualSuggestions = (context) => {
  const { viewMode, selectedBorough, selectedArea, boroughData } = context;
  const suggestions = [];

  if (viewMode === 'borough' && selectedArea?.properties?.borough) {
    // Borough-specific suggestions
    const borough = selectedArea.properties.borough;
    suggestions.push(
      `Analyze diabetes risk patterns in ${borough}`,
      `Compare ${borough} to other NYC boroughs`,
      `What interventions would work best for ${borough}?`
    );
  } else if (selectedBorough !== 'All' && boroughData?.[selectedBorough]) {
    // Borough filter applied in zip code view
    suggestions.push(
      `Analyze ${selectedBorough} borough health profile`,
      `Compare ${selectedBorough} to other boroughs`,
      `Find the highest risk areas in ${selectedBorough}`
    );
  } else if (selectedArea?.properties) {
    // Zip code specific suggestions
    const zipCode = selectedArea.properties.ZCTA5CE10 || selectedArea.properties.zip_code;
    suggestions.push(
      `What are the main health risks in ${zipCode}?`,
      "How does this area compare to nearby zip codes?",
      "What intervention programs would work best here?"
    );
  } else {
    // General exploration suggestions
    suggestions.push(
      "Show me boroughs with the highest diabetes rates",
      "Which NYC borough has the best health outcomes?",
      "Find areas with high food insecurity"
    );
  }

  return suggestions.slice(0, 3); // Return top 3 suggestions
};

/**
 * Detect query intent and extract relevant entities
 * @param {string} query - User query text
 * @returns {Object} - Parsed query intent and entities
 */
export const parseQueryIntent = (query) => {
  const lowercaseQuery = query.toLowerCase();
  
  // Intent detection
  const intents = {
    comparison: /\b(compare|versus|vs|between|difference)\b/i,
    ranking: /\b(rank|top|best|worst|highest|lowest)\b/i,
    analysis: /\b(analyze|analysis|explain|describe|summarize)\b/i,
    intervention: /\b(intervention|program|recommend|solution|prevent)\b/i,
    search: /\b(find|show|search|locate)\b/i
  };

  let detectedIntent = 'general';
  for (const [intent, pattern] of Object.entries(intents)) {
    if (pattern.test(lowercaseQuery)) {
      detectedIntent = intent;
      break;
    }
  }

  // Entity extraction
  const boroughs = ['manhattan', 'brooklyn', 'queens', 'bronx', 'staten island'];
  const metrics = ['diabetes', 'obesity', 'hypertension', 'smoking', 'food insecurity', 'healthcare access'];
  
  const detectedBoroughs = boroughs.filter(borough => 
    lowercaseQuery.includes(borough)
  );
  
  const detectedMetrics = metrics.filter(metric => 
    lowercaseQuery.includes(metric)
  );

  return {
    intent: detectedIntent,
    boroughs: detectedBoroughs,
    metrics: detectedMetrics,
    originalQuery: query
  };
};

/**
 * Enhance user query with contextual information
 * @param {string} query - Original user query
 * @param {Object} context - Current app context
 * @returns {Object} - Enhanced query data for backend
 */
export const enhanceQueryWithContext = (query, context) => {
  const { viewMode, selectedBorough, selectedArea, boroughData } = context;
  const queryAnalysis = parseQueryIntent(query);
  
  const enhancedQuery = {
    originalQuery: query,
    intent: queryAnalysis.intent,
    context: {
      viewMode,
      selectedBorough,
      hasSelectedArea: !!selectedArea,
      areaType: selectedArea?.properties?.borough ? 'borough' : 'zipcode'
    },
    selectedArea: selectedArea?.properties,
    boroughContext: null,
    suggestions: generateContextualSuggestions(context)
  };

  // Add borough context if relevant
  if (selectedBorough !== 'All' && boroughData?.[selectedBorough]) {
    enhancedQuery.boroughContext = {
      name: selectedBorough,
      zipCodeCount: boroughData[selectedBorough].zipCodeCount,
      avgMetrics: {
        riskScore: boroughData[selectedBorough].risk_score_avg,
        diabetes: boroughData[selectedBorough].diabetes_avg,
        obesity: boroughData[selectedBorough].obesity_avg
      }
    };
  }

  return enhancedQuery;
};

/**
 * Get API endpoint based on query type and context
 * @param {Object} enhancedQuery - Enhanced query with context
 * @returns {string} - API endpoint to use
 */
export const getApiEndpoint = (enhancedQuery) => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://geo-risk-spotter.onrender.com' 
    : 'http://localhost:8000';

  // Use enhanced chat endpoint for borough-aware queries
  if (enhancedQuery.context.viewMode === 'borough' || 
      enhancedQuery.boroughContext || 
      enhancedQuery.intent === 'comparison') {
    return `${baseUrl}/api/chat/enhanced`;
  }

  // Default chat endpoint
  return `${baseUrl}/api/chat`;
};

/**
 * Smart query expansion based on context
 * @param {string} query - Original query
 * @param {Object} context - App context
 * @returns {string} - Expanded query with context
 */
export const expandQueryWithContext = (query, context) => {
  const { viewMode, selectedBorough, selectedArea } = context;
  let expandedQuery = query;

  // Add context for borough queries
  if (viewMode === 'borough' && selectedArea?.properties?.borough) {
    if (!query.toLowerCase().includes(selectedArea.properties.borough.toLowerCase())) {
      expandedQuery = `${query} (Context: Currently viewing ${selectedArea.properties.borough} borough)`;
    }
  } else if (selectedBorough !== 'All') {
    if (!query.toLowerCase().includes(selectedBorough.toLowerCase())) {
      expandedQuery = `${query} (Context: Currently filtered to ${selectedBorough} borough)`;
    }
  } else if (selectedArea?.properties) {
    const zipCode = selectedArea.properties.ZCTA5CE10 || selectedArea.properties.zip_code;
    expandedQuery = `${query} (Context: Currently viewing ZIP code ${zipCode})`;
  }

  return expandedQuery;
};
