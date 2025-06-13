import geopandas as gpd
import pandas as pd
import json

# Path to the minified New York GeoJSON file in the public directory
geojson_path = 'public/ny_new_york_zip_codes_geo.min.json'

# Path to the downloaded health data CSV file
csv_path = r'C:\Users\josue\Downloads\PLACES__ZCTA_Data__GIS_Friendly_Format___2024_release_20250612.csv'

# Output path for the updated GeoJSON file
output_geojson_path = 'public/ny_new_york_zip_codes_health_data.geojson'

# Read the GeoJSON file
gdf = gpd.read_file(geojson_path)

# Read the CSV file
health_data = pd.read_csv(csv_path)

# Select relevant columns from the health data
health_data = health_data[['ZCTA5', 'DIABETES_CrudePrev', 'OBESITY_CrudePrev', 'LPA_CrudePrev', 'CSMOKING_CrudePrev', 'BPHIGH_CrudePrev', 'FOODINSECU_CrudePrev', 'ACCESS2_CrudePrev']]

# Convert ZCTA5 column to string to ensure consistent data types for merging
health_data['ZCTA5'] = health_data['ZCTA5'].astype(str)

# Define the weights for the risk score calculation
weights = {
    'DIABETES_CrudePrev': 0.20,
    'OBESITY_CrudePrev': 0.15,
    'BPHIGH_CrudePrev': 0.15,
    'CSMOKING_CrudePrev': 0.20,
    'LPA_CrudePrev': 0.10,
    'FOODINSECU_CrudePrev': 0.10,
    'ACCESS2_CrudePrev': 0.10
}

# Calculate the weighted additive RiskScore
# Ensure to handle potential missing values (NaN) - fill with 0 for simplicity in this calculation
for col, weight in weights.items():
    health_data[col] = health_data[col].fillna(0) # Fill NaN with 0
    health_data[f'{col}_weighted'] = health_data[col] * weight

health_data['RiskScore'] = health_data[[f'{col}_weighted' for col in weights.keys()]].sum(axis=1)

# Rename the ZCTA column in health data for joining
health_data = health_data.rename(columns={'ZCTA5': 'ZCTA5CE10'}) # Rename to match GeoJSON property

# Merge the GeoJSON data with the health data based on ZCTA code
# Use a left merge to keep all GeoJSON features
merged_gdf = gdf.merge(health_data[['ZCTA5CE10', 'RiskScore']], on='ZCTA5CE10', how='left')

# Handle zip codes in GeoJSON that might not be in the health data (assign a default RiskScore, e.g., 0 or NaN)
merged_gdf['RiskScore'] = merged_gdf['RiskScore'].fillna(0) # Assign 0 to zip codes with no health data

# Convert the merged GeoDataFrame to GeoJSON
geojson_data = json.loads(merged_gdf.to_json())

# Save the updated GeoJSON to a file
with open(output_geojson_path, 'w') as f:
    json.dump(geojson_data, f)

print(f"Successfully updated GeoJSON with RiskScore and saved to {output_geojson_path}")
