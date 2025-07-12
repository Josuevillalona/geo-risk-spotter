// NYC Borough mapping and aggregation service
export const NYC_BOROUGHS = {
  'Manhattan': {
    name: 'Manhattan',
    zipCodes: [
      '10001', '10002', '10003', '10004', '10005', '10006', '10007', '10009', 
      '10010', '10011', '10012', '10013', '10014', '10016', '10017', '10018', 
      '10019', '10020', '10021', '10022', '10023', '10024', '10025', '10026', 
      '10027', '10028', '10029', '10030', '10031', '10032', '10033', '10034', 
      '10035', '10036', '10037', '10038', '10039', '10040', '10041', '10043', 
      '10044', '10045', '10055', '10060', '10065', '10069', '10075', '10128', 
      '10280', '10282'
    ],
    bounds: [[40.7004, -74.0176], [40.7826, -73.9333]]
  },
  'Brooklyn': {
    name: 'Brooklyn',
    zipCodes: [
      '11201', '11202', '11203', '11204', '11205', '11206', '11207', '11208', 
      '11209', '11210', '11211', '11212', '11213', '11214', '11215', '11216', 
      '11217', '11218', '11219', '11220', '11221', '11222', '11223', '11224', 
      '11225', '11226', '11228', '11229', '11230', '11231', '11232', '11233', 
      '11234', '11235', '11236', '11237', '11238', '11239', '11249', '11251', 
      '11252', '11256'
    ],
    bounds: [[40.5707, -74.0423], [40.7394, -73.8333]]
  },
  'Queens': {
    name: 'Queens',
    zipCodes: [
      '11101', '11102', '11103', '11104', '11105', '11106', '11109', '11120', 
      '11354', '11355', '11356', '11357', '11358', '11359', '11360', '11361', 
      '11362', '11363', '11364', '11365', '11366', '11367', '11368', '11369', 
      '11370', '11371', '11372', '11373', '11374', '11375', '11376', '11377', 
      '11378', '11379', '11385', '11411', '11412', '11413', '11414', '11415', 
      '11416', '11417', '11418', '11419', '11420', '11421', '11422', '11423', 
      '11426', '11427', '11428', '11429', '11430', '11432', '11433', '11434', 
      '11435', '11436', '11691', '11692', '11693', '11694', '11695', '11697'
    ],
    bounds: [[40.5417, -73.9623], [40.8007, -73.7004]]
  },
  'Bronx': {
    name: 'Bronx',
    zipCodes: [
      '10451', '10452', '10453', '10454', '10455', '10456', '10457', '10458', 
      '10459', '10460', '10461', '10462', '10463', '10464', '10465', '10466', 
      '10467', '10468', '10469', '10470', '10471', '10472', '10473', '10474', 
      '10475'
    ],
    bounds: [[40.7855, -73.9339], [40.9154, -73.7654]]
  },
  'Staten Island': {
    name: 'Staten Island',
    zipCodes: [
      '10301', '10302', '10303', '10304', '10305', '10306', '10307', '10308', 
      '10309', '10310', '10311', '10312', '10313', '10314'
    ],
    bounds: [[40.4774, -74.2591], [40.6513, -74.0524]]
  }
};

/**
 * Get the borough for a given zip code
 * @param {string} zipCode - The zip code to look up
 * @returns {string|null} - The borough name or null if not found
 */
export const getZipCodeBorough = (zipCode) => {
  for (const [borough, data] of Object.entries(NYC_BOROUGHS)) {
    if (data.zipCodes.includes(zipCode)) {
      return borough;
    }
  }
  return null;
};

/**
 * Get all zip codes for a given borough
 * @param {string} borough - The borough name
 * @returns {string[]} - Array of zip codes
 */
export const getBoroughZipCodes = (borough) => {
  return NYC_BOROUGHS[borough]?.zipCodes || [];
};

/**
 * Calculate average value for a metric across multiple areas
 * @param {Array} areas - Array of area features
 * @param {string} metric - The metric property name
 * @returns {number} - Average value
 */
const calculateAverage = (areas, metric) => {
  const values = areas
    .map(area => area.properties[metric])
    .filter(val => val != null && !isNaN(val));
  
  return values.length > 0 ? values.reduce((a, b) => a + b) / values.length : 0;
};

/**
 * Aggregate zip code data to borough level
 * @param {Array} zipCodeFeatures - Array of GeoJSON features with zip code data
 * @returns {Object} - Borough-level aggregated data
 */
export const aggregateBoroughData = (zipCodeFeatures) => {
  const boroughData = {};
  
  Object.entries(NYC_BOROUGHS).forEach(([borough, config]) => {
    const boroughZipCodes = zipCodeFeatures.filter(area => 
      config.zipCodes.includes(area.properties.ZCTA5CE10)
    );
    
    if (boroughZipCodes.length > 0) {
      boroughData[borough] = {
        name: borough,
        zipCodeCount: boroughZipCodes.length,
        diabetes_avg: calculateAverage(boroughZipCodes, 'DIABETES_CrudePrev'),
        obesity_avg: calculateAverage(boroughZipCodes, 'OBESITY_CrudePrev'),
        hypertension_avg: calculateAverage(boroughZipCodes, 'BPHIGH_CrudePrev'),
        smoking_avg: calculateAverage(boroughZipCodes, 'CSMOKING_CrudePrev'),
        physical_inactivity_avg: calculateAverage(boroughZipCodes, 'LPA_CrudePrev'),
        food_insecurity_avg: calculateAverage(boroughZipCodes, 'FOODINSECU_CrudePrev'),
        healthcare_access_avg: calculateAverage(boroughZipCodes, 'ACCESS2_CrudePrev'),
        risk_score_avg: calculateAverage(boroughZipCodes, 'RiskScore'),
        bounds: config.bounds,
        zipCodes: boroughZipCodes
      };
    }
  });
  
  return boroughData;
};

/**
 * Filter zip code features by borough
 * @param {Array} zipCodeFeatures - Array of GeoJSON features
 * @param {string} borough - Borough to filter by
 * @returns {Array} - Filtered features
 */
export const filterZipCodesByBorough = (zipCodeFeatures, borough) => {
  if (borough === 'All') return zipCodeFeatures;
  
  const boroughZipCodes = getBoroughZipCodes(borough);
  return zipCodeFeatures.filter(feature => 
    boroughZipCodes.includes(feature.properties.ZCTA5CE10)
  );
};

/**
 * Get borough bounds for map centering
 * @param {string} borough - Borough name
 * @returns {Array|null} - Bounds array [[lat, lng], [lat, lng]] or null
 */
export const getBoroughBounds = (borough) => {
  return NYC_BOROUGHS[borough]?.bounds || null;
};

/**
 * Cache keys for localStorage
 */
const BOUNDARY_CACHE_KEY = 'riskpulse_borough_boundaries';
const BOUNDARY_CACHE_VERSION = '1.0';
const CACHE_EXPIRY_HOURS = 24;

/**
 * Check if cached data is still valid
 * @param {Object} cachedData - Cached data with timestamp
 * @returns {boolean} - Whether cache is still valid
 */
const isCacheValid = (cachedData) => {
  if (!cachedData || !cachedData.timestamp) return false;
  
  const now = Date.now();
  const cacheAge = now - cachedData.timestamp;
  const maxAge = CACHE_EXPIRY_HOURS * 60 * 60 * 1000; // Convert to milliseconds
  
  return cacheAge < maxAge && cachedData.version === BOUNDARY_CACHE_VERSION;
};

/**
 * Get borough boundaries from cache
 * @returns {Object|null} - Cached boundaries or null
 */
const getBoundariesFromCache = () => {
  try {
    const cached = localStorage.getItem(BOUNDARY_CACHE_KEY);
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    if (isCacheValid(data)) {
      console.log('Using cached borough boundaries');
      return data.boundaries;
    } else {
      console.log('Cached borough boundaries expired, removing...');
      localStorage.removeItem(BOUNDARY_CACHE_KEY);
      return null;
    }
  } catch (error) {
    console.warn('Error reading borough boundaries from cache:', error);
    localStorage.removeItem(BOUNDARY_CACHE_KEY);
    return null;
  }
};

/**
 * Save borough boundaries to cache
 * @param {Object} boundaries - Borough boundaries data
 */
const saveBoundariesToCache = (boundaries) => {
  try {
    const cacheData = {
      boundaries,
      timestamp: Date.now(),
      version: BOUNDARY_CACHE_VERSION
    };
    
    localStorage.setItem(BOUNDARY_CACHE_KEY, JSON.stringify(cacheData));
    console.log('Borough boundaries cached successfully');
  } catch (error) {
    console.warn('Error caching borough boundaries:', error);
    // Continue without caching if localStorage is full or unavailable
  }
}

/**
 * Load borough boundaries from GeoJSON with improved caching
 * @param {string} url - URL or path to the borough GeoJSON file
 * @param {boolean} forceRefresh - Force refresh from remote source
 * @returns {Promise<Object>} - Borough boundaries GeoJSON data
 */
export const loadBoroughBoundaries = async (url = null, forceRefresh = false) => {
  // Try cache first unless force refresh is requested
  if (!forceRefresh) {
    const cachedBoundaries = getBoundariesFromCache();
    if (cachedBoundaries) {
      return cachedBoundaries;
    }
  }

  const boroughUrl = url || 'https://geo-risk-spotspot-geojson.s3.us-east-1.amazonaws.com/nyc_borough_boundaries.geojson';
  
  try {
    console.log('Loading borough boundaries from:', boroughUrl);
    const response = await fetch(boroughUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Successfully loaded borough boundaries:', data.features?.length, 'features');
    
    // Cache the loaded boundaries
    saveBoundariesToCache(data);
    
    return data;
  } catch (error) {
    console.warn('Failed to load borough boundaries from S3, trying local fallback:', error.message);
    
    // Try local fallback
    try {
      const fallbackResponse = await fetch('/nyc_borough_boundaries.geojson');
      if (!fallbackResponse.ok) {
        throw new Error(`Local fallback failed: ${fallbackResponse.status}`);
      }
      
      const fallbackData = await fallbackResponse.json();
      console.log('Successfully loaded borough boundaries from local fallback:', fallbackData.features?.length, 'features');
      
      // Cache the loaded boundaries
      saveBoundariesToCache(fallbackData);
      
      return fallbackData;
    } catch (fallbackError) {
      console.error('All borough boundary loading methods failed:', fallbackError.message);
      throw new Error('Unable to load borough boundaries from any source');
    }
  }
};

/**
 * Test S3 connectivity for debugging
 */
export const testS3Connection = async () => {
  const testUrl = 'https://geo-risk-spotspot-geojson.s3.us-east-1.amazonaws.com/nyc_borough_boundaries.geojson';
  
  try {
    console.log('Testing S3 connection to:', testUrl);
    const response = await fetch(testUrl, {
      method: 'HEAD', // Use HEAD request to test without downloading full file
      mode: 'cors'
    });
    
    console.log('S3 connection test - Status:', response.status);
    console.log('S3 connection test - Headers:', [...response.headers.entries()]);
    
    if (response.ok) {
      console.log('✅ S3 connection successful!');
      return true;
    } else {
      console.log('❌ S3 connection failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ S3 connection error:', error.message);
    return false;
  }
};

/**
 * Merge aggregated health data with actual borough boundaries
 * @param {Object} boroughGeoJSON - Borough boundaries GeoJSON
 * @param {Object} healthData - Aggregated health data by borough
 * @returns {Object} - Enhanced GeoJSON with health metrics
 */
export const mergeBoroughDataWithBoundaries = (boroughGeoJSON, healthData) => {
  if (!boroughGeoJSON || !boroughGeoJSON.features || !healthData) {
    console.warn('Invalid data for merging borough boundaries with health data');
    return boroughGeoJSON;
  }
  
  // Create enhanced features with health data
  const enhancedFeatures = boroughGeoJSON.features.map(feature => {
    const boroughName = feature.properties.borough_name;
    const healthMetrics = healthData[boroughName];
    
    if (!healthMetrics) {
      console.warn(`No health data found for borough: ${boroughName}`);
      return feature;
    }
    
    // Merge health data into feature properties
    return {
      ...feature,
      properties: {
        ...feature.properties,
        // Add health metrics with consistent naming
        zipCodeCount: healthMetrics.zipCodeCount || 0,
        risk_score_avg: healthMetrics.risk_score_avg || 0,
        diabetes_avg: healthMetrics.diabetes_avg || 0,
        obesity_avg: healthMetrics.obesity_avg || 0,
        physical_inactivity_avg: healthMetrics.physical_inactivity_avg || 0,
        smoking_avg: healthMetrics.smoking_avg || 0,
        hypertension_avg: healthMetrics.hypertension_avg || 0,
        food_insecurity_avg: healthMetrics.food_insecurity_avg || 0,
        healthcare_access_avg: healthMetrics.healthcare_access_avg || 0,
        // Add health metrics for Map.jsx API calls and popups (using avg naming)
        avgRiskScore: healthMetrics.risk_score_avg || 0,
        avgDiabetes: healthMetrics.diabetes_avg || 0,
        avgObesity: healthMetrics.obesity_avg || 0,
        avgPhysicalInactivity: healthMetrics.physical_inactivity_avg || 0,
        avgCurrentSmoking: healthMetrics.smoking_avg || 0,
        avgHypertension: healthMetrics.hypertension_avg || 0,
        avgFoodInsecurity: healthMetrics.food_insecurity_avg || 0,
        avgHealthcareAccess: healthMetrics.healthcare_access_avg || 0,
        // Add health metrics for popup compatibility (rates naming)
        avgDiabetesRate: healthMetrics.diabetes_avg || 0,
        avgObesityRate: healthMetrics.obesity_avg || 0,
        // Add identifier for popup display
        borough: boroughName,
        zip_code: `${boroughName} Borough` // For compatibility with popup
      }
    };
  });
  
  return {
    ...boroughGeoJSON,
    features: enhancedFeatures
  };
};

/**
 * Preload critical data with improved error handling and retry logic
 * @returns {Promise<Object>} - Preloaded data object
 */
export const preloadCriticalData = async () => {
  const results = {
    boundaries: null,
    healthData: null,
    errors: []
  };

  try {
    // Start both operations in parallel
    const [boundariesResult, healthDataResult] = await Promise.allSettled([
      loadBoroughBoundaries(),
      fetch('https://geo-risk-spotspot-geojson.s3.us-east-1.amazonaws.com/ny_new_york_zip_codes_health.geojson')
        .then(response => response.json())
    ]);

    // Handle boundaries result
    if (boundariesResult.status === 'fulfilled') {
      results.boundaries = boundariesResult.value;
      console.log('✅ Boundaries preloaded successfully');
    } else {
      results.errors.push(`Boundaries failed: ${boundariesResult.reason.message}`);
      console.warn('❌ Boundaries preload failed:', boundariesResult.reason);
    }

    // Handle health data result
    if (healthDataResult.status === 'fulfilled') {
      results.healthData = healthDataResult.value;
      console.log('✅ Health data preloaded successfully');
    } else {
      results.errors.push(`Health data failed: ${healthDataResult.reason.message}`);
      console.warn('❌ Health data preload failed:', healthDataResult.reason);
    }

    return results;
  } catch (error) {
    console.error('Critical data preload failed:', error);
    results.errors.push(`Critical failure: ${error.message}`);
    return results;
  }
};
