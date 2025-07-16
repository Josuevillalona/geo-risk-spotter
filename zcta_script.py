import geopandas as gpd
import pandas as pd
import json

# Path to the minified GeoJSON file
geojson_path = 'public/ny_new_york_zip_codes_geo.min.json'
# Path to the health data CSV file
health_data_path = 'C:/Users/josue/Downloads/PLACES__ZCTA_Data__GIS_Friendly_Format___2024_release_20250612.csv'
# Output path for the new GeoJSON file with health data
output_geojson_path = 'public/ny_new_york_zip_codes_health.geojson'

# Read the minified GeoJSON file
gdf = gpd.read_file(geojson_path)

# Read the health data CSV file
health_df = pd.read_csv(health_data_path)

# Ensure the ZCTA columns are of the same type (e.g., string) for merging
gdf['ZCTA5CE10'] = gdf['ZCTA5CE10'].astype(str)
health_df['ZCTA5'] = health_df['ZCTA5'].astype(str)

# Merge the GeoDataFrame with the health data DataFrame
# Use a left merge to keep all geometries from the GeoJSON
merged_gdf = gdf.merge(health_df, left_on='ZCTA5CE10', right_on='ZCTA5', how='left')

# Define the weights for the RiskScore calculation (keeping original formula for backward compatibility)
weights = {
    'DIABETES_CrudePrev': 0.20,
    'OBESITY_CrudePrev': 0.15,
    'BPHIGH_CrudePrev': 0.15,
    'CSMOKING_CrudePrev': 0.20,
    'LPA_CrudePrev': 0.10,
    'FOODINSECU_CrudePrev': 0.10,
    'ACCESS2_CrudePrev': 0.10,
}

# Additional health metrics to include in the enhanced dataset
additional_metrics = [
    # Population demographics
    'TotalPopulation',
    'TotalPop18plus',
    
    # Social determinants of health
    'DEPRESSION_CrudePrev',
    'ISOLATION_CrudePrev',
    'HOUSINSECU_CrudePrev',
    'LACKTRPT_CrudePrev',
    'FOODSTAMP_CrudePrev',
    
    # Additional health outcomes
    'GHLTH_CrudePrev',      # General health (fair or poor)
    'MHLTH_CrudePrev',      # Mental health not good
    'PHLTH_CrudePrev',      # Physical health not good
    'CHECKUP_CrudePrev',    # Routine checkup
    'DENTAL_CrudePrev',     # Dental visit
    'SLEEP_CrudePrev',      # Short sleep duration
]

# Clean and process the data before calculations
def clean_numeric_value(value):
    """Clean numeric values that may have confidence interval artifacts"""
    if pd.isna(value):
        return 0.0
    
    # Convert to string and clean
    str_val = str(value).strip()
    
    # Remove any quotes and parentheses artifacts
    str_val = str_val.replace('"', '').replace('(', '').replace(')', '')
    
    # If it contains multiple numbers (like "31.1 35.3"), take the first one
    if ' ' in str_val:
        str_val = str_val.split()[0]
    
    # Try to convert to float
    try:
        return float(str_val)
    except (ValueError, TypeError):
        return 0.0

# Clean all columns that may have data quality issues
all_columns_to_clean = list(weights.keys()) + additional_metrics

for col in all_columns_to_clean:
    if col in merged_gdf.columns:
        print(f"Cleaning column: {col}")
        # Apply cleaning function
        merged_gdf[col] = merged_gdf[col].apply(clean_numeric_value)

# Calculate the RiskScore (keeping original calculation for backward compatibility)
# Now use cleaned data for calculation

merged_gdf['RiskScore'] = sum(merged_gdf[col] * weights[col] for col in weights.keys())

# Select relevant columns for the output GeoJSON
# Keep geometry, rename ZCTA5CE10 to zip_code, and include RiskScore and all raw data columns
# Include original metrics (for backward compatibility) plus additional metrics
available_additional_metrics = [col for col in additional_metrics if col in merged_gdf.columns]
output_cols = ['geometry', 'ZCTA5CE10', 'RiskScore'] + list(weights.keys()) + available_additional_metrics
output_gdf = merged_gdf[output_cols]

# Rename ZCTA5CE10 to zip_code for frontend consistency
output_gdf = output_gdf.rename(columns={'ZCTA5CE10': 'zip_code'})

# Print properties of the first few features for inspection
print("\nSample Feature Properties after merge and fillna(0):")
for i in range(min(3, len(output_gdf))):
    feature_props = output_gdf.iloc[i].drop('geometry').to_dict()
    print(f"Feature {i+1}: {feature_props}")

# Print statistics about the calculated RiskScore
print("\nRiskScore Statistics:")
print(merged_gdf['RiskScore'].describe())

# Print information about included metrics
print(f"\nTotal metrics included: {len(output_cols)-2}")  # -2 for geometry and zip_code
print(f"Original risk metrics: {list(weights.keys())}")
print(f"Additional metrics included: {available_additional_metrics}")

# Save the updated GeoDataFrame to a new GeoJSON file in the public directory
output_gdf.to_file(output_geojson_path, driver='GeoJSON')

print(f"\nSuccessfully created enhanced GeoJSON with health data: {output_geojson_path}")
print(f"File contains {len(output_gdf)} features with {len(output_gdf.columns)-1} properties each")
